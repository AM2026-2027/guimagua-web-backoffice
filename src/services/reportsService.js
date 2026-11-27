import {
  Timestamp,
  collection,
  documentId,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from 'firebase/firestore'
import { db } from '../config/firebase'

// Módulo de relatórios: só leitura de coleções de outros módulos (AGENTS.md, secção 3).
const APPOINTMENTS = 'appointments'
const POOL_READINGS = 'pool_readings'
const STOCK_MOVEMENTS = 'stock_movements'
const USERS = 'users'
const SERVICES = 'services'

export const INTERVENTIONS_PAGE_SIZE = 20
export const MOVEMENTS_PAGE_SIZE = 25
// O operador `in` do Firestore aceita no máximo 30 valores.
const IN_QUERY_MAX = 30

function normalize(snapshot) {
  return { id: snapshot.id, ...snapshot.data() }
}

function pageResult(snapshot, pageSize, cursor) {
  const docs = snapshot.docs
  return {
    items: docs.map(normalize),
    cursor: docs.length > 0 ? docs[docs.length - 1] : cursor,
    hasMore: docs.length === pageSize,
  }
}

/** Técnicos e comerciais (lista pequena, lida uma vez) para os filtros e para mostrar nomes. */
export async function listStaff() {
  const snapshot = await getDocs(query(collection(db, USERS), where('role', 'in', ['technician', 'commercial'])))
  return snapshot.docs.map(normalize)
}

/** Catálogo de serviços (lista pequena, lida uma vez). */
export async function listServices() {
  const snapshot = await getDocs(collection(db, SERVICES))
  return snapshot.docs.map(normalize)
}

/** Documentos de uma coleção pelo id, em lotes de 30 (clientes, piscinas, consumíveis de uma página). */
export async function getDocsByIds(collectionName, ids) {
  const unique = [...new Set(ids.filter(Boolean))]
  if (unique.length === 0) return []
  const chunks = []
  for (let i = 0; i < unique.length; i += IN_QUERY_MAX) chunks.push(unique.slice(i, i + IN_QUERY_MAX))
  const snapshots = await Promise.all(
    chunks.map((chunk) => getDocs(query(collection(db, collectionName), where(documentId(), 'in', chunk)))),
  )
  return snapshots.flatMap((snapshot) => snapshot.docs.map(normalize))
}

/**
 * Página do histórico de intervenções, da mais recente para a mais antiga (paginação por cursor, RNF-WEB02).
 * Filtros no servidor: estados (`statuses`), período em ms [startMs, endMs), técnico e piscina.
 * Exige índices compostos (ex.: status + date; status + tech_id + date), criados a partir do link do erro.
 */
export async function listInterventionsPage({ statuses, startMs, endMs, techId, poolId, cursor = null }) {
  const constraints = [statuses.length === 1 ? where('status', '==', statuses[0]) : where('status', 'in', statuses)]
  if (techId) constraints.push(where('tech_id', '==', techId))
  if (poolId) constraints.push(where('pool_id', '==', poolId))
  if (startMs != null) constraints.push(where('date', '>=', Timestamp.fromMillis(startMs)))
  if (endMs != null) constraints.push(where('date', '<', Timestamp.fromMillis(endMs)))
  constraints.push(orderBy('date', 'desc'))
  if (cursor) constraints.push(startAfter(cursor))
  constraints.push(limit(INTERVENTIONS_PAGE_SIZE))
  const snapshot = await getDocs(query(collection(db, APPOINTMENTS), ...constraints))
  return pageResult(snapshot, INTERVENTIONS_PAGE_SIZE, cursor)
}

/** Leituras físico-químicas registadas numa intervenção (só quando se abre o detalhe). */
export async function listReadingsByAppointment(appointmentId) {
  const snapshot = await getDocs(query(collection(db, POOL_READINGS), where('appointment_id', '==', appointmentId)))
  return snapshot.docs.map(normalize)
}

/** Rota de um técnico num dia: agendamentos no intervalo [startMs, endMs), por ordem de hora. */
export async function listTechRoute(techId, startMs, endMs) {
  const snapshot = await getDocs(
    query(
      collection(db, APPOINTMENTS),
      where('tech_id', '==', techId),
      where('date', '>=', Timestamp.fromMillis(startMs)),
      where('date', '<', Timestamp.fromMillis(endMs)),
      orderBy('date', 'asc'),
    ),
  )
  return snapshot.docs.map(normalize)
}

/**
 * Página do registo de movimentos de stock (do inventário), do mais recente para o mais antigo.
 * Filtros no servidor: tipo ('in' | 'out') e período em ms. O filtro por tipo exige o índice type + created_at.
 */
export async function listStockMovementsPage({ type, startMs, endMs, cursor = null }) {
  const constraints = []
  if (type) constraints.push(where('type', '==', type))
  if (startMs != null) constraints.push(where('created_at', '>=', Timestamp.fromMillis(startMs)))
  if (endMs != null) constraints.push(where('created_at', '<', Timestamp.fromMillis(endMs)))
  constraints.push(orderBy('created_at', 'desc'))
  if (cursor) constraints.push(startAfter(cursor))
  constraints.push(limit(MOVEMENTS_PAGE_SIZE))
  const snapshot = await getDocs(query(collection(db, STOCK_MOVEMENTS), ...constraints))
  return pageResult(snapshot, MOVEMENTS_PAGE_SIZE, cursor)
}
