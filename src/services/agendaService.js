import {
  Timestamp,
  collection,
  doc,
  documentId,
  getDoc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  startAfter,
  where,
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { getLisbonDayRange } from '../features/agenda/utils/date'

const APPOINTMENTS = 'appointments'
const USERS = 'users'
const SERVICES = 'services'
const POOLS = 'pools'
const CLIENTS = 'clients'
const POOL_READINGS = 'pool_readings'
const SETTINGS = 'settings'
const CONSUMABLES = 'consumables'
const IN_QUERY_MAX = 30
const CLIENT_SEARCH_LIMIT = 10

/** Erro lançado quando o agendamento já não está `scheduled` (ex.: cancelado noutro separador). */
export const APPOINTMENT_NOT_SCHEDULED = 'agenda/not-scheduled'
export const AGENDA_MONTH_PAGE_SIZE = 500

function normalize(snapshot) {
  return { id: snapshot.id, ...snapshot.data() }
}

async function getDocumentsByIds(collectionName, ids) {
  const uniqueIds = [...new Set(ids.filter(Boolean))]
  const chunks = []
  for (let index = 0; index < uniqueIds.length; index += IN_QUERY_MAX) {
    chunks.push(uniqueIds.slice(index, index + IN_QUERY_MAX))
  }
  const snapshots = await Promise.all(
    chunks.map((chunk) =>
      getDocs(query(collection(db, collectionName), where(documentId(), 'in', chunk))),
    ),
  )
  return snapshots.flatMap((snapshot) => snapshot.docs.map(normalize))
}

export function subscribeAppointmentsForDay(dateKey, onItems, onError) {
  const { start, end } = getLisbonDayRange(dateKey)
  const appointmentsQuery = query(
    collection(db, APPOINTMENTS),
    where('date', '>=', Timestamp.fromDate(start)),
    where('date', '<', Timestamp.fromDate(end)),
    orderBy('date'),
  )

  return onSnapshot(
    appointmentsQuery,
    (snapshot) => onItems(snapshot.docs.map(normalize)),
    onError,
  )
}

export async function listAgendaAppointmentsMonthPage({ start, end, cursor = null, pageSize }) {
  const constraints = [
    where('date', '>=', Timestamp.fromDate(start)),
    where('date', '<', Timestamp.fromDate(end)),
    orderBy('date'),
  ]
  if (cursor) constraints.push(startAfter(cursor))
  constraints.push(limit(pageSize))

  const snapshot = await getDocs(query(collection(db, APPOINTMENTS), ...constraints))
  return {
    items: snapshot.docs.map(normalize),
    cursor: snapshot.docs.at(-1) ?? cursor,
  }
}

export async function listAgendaStaff() {
  const snapshot = await getDocs(
    query(collection(db, USERS), where('role', 'in', ['technician', 'commercial'])),
  )
  return snapshot.docs.map(normalize)
}

export async function listAgendaServices() {
  const snapshot = await getDocs(collection(db, SERVICES))
  return snapshot.docs.map(normalize)
}

export function listPoolsByIds(ids) {
  return getDocumentsByIds(POOLS, ids)
}

export function listClientsByIds(ids) {
  return getDocumentsByIds(CLIENTS, ids)
}

export async function getLatestPoolReading(poolId) {
  const snapshot = await getDocs(
    query(
      collection(db, POOL_READINGS),
      where('pool_id', '==', poolId),
      orderBy('timestamp', 'desc'),
      limit(1),
    ),
  )
  return snapshot.empty ? null : normalize(snapshot.docs[0])
}

export async function getAlertThresholds() {
  const snapshot = await getDoc(doc(db, SETTINGS, 'alert_thresholds'))
  return snapshot.exists() ? normalize(snapshot) : null
}

// ---------------------------------------------------------------------------
// Novo agendamento, reagendamento e cancelamento (RF-WEB04, D-10)
// ---------------------------------------------------------------------------

/**
 * Pesquisa de clientes por prefixo: em `email` se o termo tiver "@", senão em `name_lower`
 * (minúsculas sem acentos, preenchido pelo módulo clients). O termo chega já normalizado.
 * Os clientes criados sem `name_lower` (ex.: pela App Cliente) só aparecem na pesquisa por email.
 */
export async function searchAgendaClients(term) {
  const field = term.includes('@') ? 'email' : 'name_lower'
  const snapshot = await getDocs(
    query(
      collection(db, CLIENTS),
      where(field, '>=', term),
      where(field, '<=', `${term}`),
      orderBy(field),
      limit(CLIENT_SEARCH_LIMIT),
    ),
  )
  return snapshot.docs.map(normalize)
}

export async function listPoolsByClient(clientId) {
  const snapshot = await getDocs(query(collection(db, POOLS), where('client_id', '==', clientId)))
  return snapshot.docs.map(normalize)
}

export function getConsumablesByIds(ids) {
  return getDocumentsByIds(CONSUMABLES, ids)
}

/**
 * Agendamentos com início em [start, end). Só usa o intervalo em `date` (índice simples, sem índice
 * composto); o filtro por colaborador e estado é feito no cliente, porque um dia tem poucos agendamentos.
 */
export async function listAppointmentsInRange(start, end) {
  const snapshot = await getDocs(
    query(
      collection(db, APPOINTMENTS),
      where('date', '>=', Timestamp.fromDate(start)),
      where('date', '<', Timestamp.fromDate(end)),
      orderBy('date'),
    ),
  )
  return snapshot.docs.map(normalize)
}

/**
 * Lê os consumíveis dentro da transação e devolve só os que existem: um `update` num documento
 * inexistente faria falhar a transação inteira e impediria o agendamento.
 */
async function readExistingConsumables(transaction, deltas) {
  const refs = deltas.map((item) => doc(db, CONSUMABLES, item.consumable_id))
  const snapshots = await Promise.all(refs.map((ref) => transaction.get(ref)))
  return deltas
    .map((item, index) => ({ ...item, ref: refs[index], exists: snapshots[index].exists() }))
    .filter((item) => item.exists)
}

/**
 * Cria o agendamento e reserva o stock projetado (D-10) numa só transação: ou fica tudo gravado, ou nada.
 * `consumableDeltas`: `{ consumable_id, quantity }[]` (os `base_consumables` do serviço);
 * cada `projected_stock` desce `quantity` com `increment`, para não perder escritas em simultâneo.
 * Os campos que a App preenche ficam com valores vazios, para a App não encontrar campos em falta.
 */
export async function createAppointment(payload, consumableDeltas = []) {
  const appointmentRef = doc(collection(db, APPOINTMENTS))
  await runTransaction(db, async (transaction) => {
    const consumables = await readExistingConsumables(transaction, consumableDeltas)
    transaction.set(appointmentRef, {
      ...payload,
      date: Timestamp.fromDate(payload.date),
      end_date: Timestamp.fromDate(payload.end_date),
      status: 'scheduled',
      checkin_timestamp: null,
      checklist_results: {},
      anomaly_reported: false,
      photo_paths: [],
      report_pdf_path: null,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    })
    consumables.forEach((item) => {
      transaction.update(item.ref, {
        projected_stock: increment(-item.quantity),
        updated_at: serverTimestamp(),
      })
    })
  })
  return appointmentRef.id
}

/**
 * Reagenda (data, hora, colaborador, notas). O serviço e a piscina não mudam, por isso o stock reservado
 * também não. Só é permitido enquanto o agendamento estiver `scheduled`.
 */
export async function rescheduleAppointment(id, payload) {
  const appointmentRef = doc(db, APPOINTMENTS, id)
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(appointmentRef)
    if (!snapshot.exists() || snapshot.data().status !== 'scheduled') {
      const error = new Error('O agendamento já não está agendado.')
      error.code = APPOINTMENT_NOT_SCHEDULED
      throw error
    }
    transaction.update(appointmentRef, {
      ...payload,
      date: Timestamp.fromDate(payload.date),
      end_date: Timestamp.fromDate(payload.end_date),
      updated_at: serverTimestamp(),
    })
  })
}

/**
 * Cancela e devolve o stock projetado reservado (D-10). A transação confirma primeiro que o estado ainda é
 * `scheduled`: um segundo cancelamento (ou um já iniciado pela App) não devolve o stock outra vez.
 */
export async function cancelAppointment(id, consumableDeltas = []) {
  const appointmentRef = doc(db, APPOINTMENTS, id)
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(appointmentRef)
    const consumables = await readExistingConsumables(transaction, consumableDeltas)
    if (!snapshot.exists() || snapshot.data().status !== 'scheduled') {
      const error = new Error('O agendamento já não está agendado.')
      error.code = APPOINTMENT_NOT_SCHEDULED
      throw error
    }
    transaction.update(appointmentRef, { status: 'cancelled', updated_at: serverTimestamp() })
    consumables.forEach((item) => {
      transaction.update(item.ref, {
        projected_stock: increment(item.quantity),
        updated_at: serverTimestamp(),
      })
    })
  })
}
