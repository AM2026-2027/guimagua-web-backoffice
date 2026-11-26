import {
  collection,
  doc,
  documentId,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore'
import { db } from '../config/firebase'

// Nomes oficiais das coleções (docs/modelo-dados.md).
const APPOINTMENTS = 'appointments'
const TICKETS = 'tickets'
const POOL_READINGS = 'pool_readings'
const CONSUMABLES = 'consumables'
const USERS = 'users'
const POOLS = 'pools'
const CLIENTS = 'clients'
// Documento único para os limiares de alerta editáveis no dashboard (D-11).
const ALERT_THRESHOLDS_DOC = ['settings', 'alert_thresholds']

const TODAY_APPOINTMENTS_LIMIT = 100
const OPEN_TICKETS_LIMIT = 20
const RECENT_READINGS_LIMIT = 80
const CONSUMABLES_LIMIT = 100
// O operador `in` do Firestore aceita no máximo 30 valores.
const IN_QUERY_MAX = 30

function normalize(snapshot) {
  return { id: snapshot.id, ...snapshot.data() }
}

/**
 * Subscreve os agendamentos do dia atual (`dayStart` <= `date` < `dayEnd`).
 * Requer que o chamador limpe a subscrição com a função devolvida.
 */
export function subscribeTodayAppointments(dayStart, dayEnd, onData, onError) {
  const appointmentsQuery = query(
    collection(db, APPOINTMENTS),
    where('date', '>=', dayStart),
    where('date', '<', dayEnd),
    orderBy('date', 'asc'),
    limit(TODAY_APPOINTMENTS_LIMIT),
  )
  return onSnapshot(
    appointmentsQuery,
    (snapshot) => onData(snapshot.docs.map(normalize)),
    onError,
  )
}

/**
 * Subscreve os pedidos de assistência/orçamento em aberto (`pending` ou `in_analysis`).
 * Pode exigir índice composto (`status` + `created_at` desc) na consola do Firestore.
 */
export function subscribeOpenTickets(onData, onError) {
  const ticketsQuery = query(
    collection(db, TICKETS),
    where('status', 'in', ['pending', 'in_analysis']),
    orderBy('created_at', 'desc'),
    limit(OPEN_TICKETS_LIMIT),
  )
  return onSnapshot(
    ticketsQuery,
    (snapshot) => onData(snapshot.docs.map(normalize)),
    onError,
  )
}

/**
 * Subscreve as leituras físico-químicas mais recentes (`pool_readings`).
 * A deduplicação por `pool_id` é feita no cliente para evitar subscrições em ciclo (D-12).
 */
export function subscribeRecentPoolReadings(onData, onError) {
  const readingsQuery = query(
    collection(db, POOL_READINGS),
    orderBy('timestamp', 'desc'),
    limit(RECENT_READINGS_LIMIT),
  )
  return onSnapshot(
    readingsQuery,
    (snapshot) => onData(snapshot.docs.map(normalize)),
    onError,
  )
}

/**
 * Carrega técnicos e comerciais uma única vez (lista pequena, D-05).
 * Filtra `is_active` no cliente para não exigir índice composto (`role` + `is_active`).
 */
export async function listStaffUsers() {
  const snapshot = await getDocs(
    query(collection(db, USERS), where('role', 'in', ['technician', 'commercial'])),
  )
  return snapshot.docs.map(normalize).filter((user) => user.is_active !== false)
}

/**
 * Carrega o catálogo de consumíveis por ordem alfabética (máx. 100) e filtra os ativos no cliente
 * para evitar índice composto (`is_active` + `name`).
 */
export async function listActiveConsumables() {
  const snapshot = await getDocs(
    query(collection(db, CONSUMABLES), orderBy('name'), limit(CONSUMABLES_LIMIT)),
  )
  return snapshot.docs.map(normalize).filter((item) => item.is_active !== false)
}

/** Lê os limiares de alerta globais em `settings/alert_thresholds` (D-11). */
export async function getAlertThresholds() {
  const snapshot = await getDoc(doc(db, ...ALERT_THRESHOLDS_DOC))
  return snapshot.exists() ? normalize(snapshot) : null
}

/** Atualiza os limiares de alerta globais com auditoria (`updated_at`, `updated_by`). */
export async function saveAlertThresholds(payload, adminUid) {
  await setDoc(
    doc(db, ...ALERT_THRESHOLDS_DOC),
    {
      ...payload,
      updated_at: serverTimestamp(),
      updated_by: adminUid ?? null,
    },
    { merge: true },
  )
}

/**
 * Contagens agregadas para os cartões de KPI sem descarregar documentos completos
 * (1 leitura faturada por cada 1000 documentos contados).
 */
export async function countDashboardEntities() {
  const [clientsSnap, poolsSnap, openTicketsSnap] = await Promise.all([
    getCountFromServer(query(collection(db, CLIENTS), where('is_active', '==', true))),
    getCountFromServer(query(collection(db, POOLS), where('is_active', '==', true))),
    getCountFromServer(query(collection(db, TICKETS), where('status', 'in', ['pending', 'in_analysis']))),
  ])
  return {
    activeClients: clientsSnap.data().count,
    activePools: poolsSnap.data().count,
    openTickets: openTicketsSnap.data().count,
  }
}

async function fetchDocsByIds(collectionName, ids) {
  const uniqueIds = [...new Set(ids.filter(Boolean))]
  if (uniqueIds.length === 0) return []
  const chunks = []
  for (let i = 0; i < uniqueIds.length; i += IN_QUERY_MAX) {
    chunks.push(uniqueIds.slice(i, i + IN_QUERY_MAX))
  }
  const snapshots = await Promise.all(
    chunks.map((chunk) => getDocs(query(collection(db, collectionName), where(documentId(), 'in', chunk)))),
  )
  return snapshots.flatMap((snapshot) => snapshot.docs.map(normalize))
}

export function getPoolsByIds(poolIds) {
  return fetchDocsByIds(POOLS, poolIds)
}

export function getClientsByIds(clientIds) {
  return fetchDocsByIds(CLIENTS, clientIds)
}
