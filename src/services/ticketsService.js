import {
  addDoc,
  collection,
  doc,
  documentId,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  startAfter,
  Timestamp,
  where,
} from 'firebase/firestore'
import { db } from '../config/firebase'

const TICKETS = 'tickets'
const CLIENTS = 'clients'
const POOLS = 'pools'
const APPOINTMENTS = 'appointments'
const POOL_READINGS = 'pool_readings'
const SETTINGS = 'settings'
const ALERT_THRESHOLDS = 'alert_thresholds'
const OPEN_STATUSES = ['pending', 'in_analysis']
const TICKET_CATEGORIES = ['quote', 'breakdown', 'maintenance']
const MAX_IN_VALUES = 30

export const TICKETS_PAGE_SIZE = 20
export const CLIENTS_PAGE_SIZE = 20
export const TICKET_APPOINTMENTS_PAGE_SIZE = 5

function normalize(snapshot) {
  return { id: snapshot.id, ...snapshot.data() }
}

function queueConstraints({ category = 'all', sla = 'all', slaCutoffs } = {}) {
  const constraints = [where('status', 'in', OPEN_STATUSES)]
  if (category !== 'all') constraints.push(where('category', '==', category))

  const { criticalBefore, attentionBefore } = timestampCutoffs(slaCutoffs)
  if (sla === 'critical') constraints.push(where('created_at', '<=', criticalBefore))
  if (sla === 'attention') {
    constraints.push(
      where('created_at', '>', criticalBefore),
      where('created_at', '<=', attentionBefore),
    )
  }
  if (sla === 'regular') constraints.push(where('created_at', '>', attentionBefore))

  return constraints
}

function timestampCutoffs(slaCutoffs) {
  if (!Number.isFinite(slaCutoffs?.criticalBefore) || !Number.isFinite(slaCutoffs?.attentionBefore)) {
    throw new Error('Os limites de SLA não foram fornecidos.')
  }
  return {
    criticalBefore: Timestamp.fromMillis(slaCutoffs.criticalBefore),
    attentionBefore: Timestamp.fromMillis(slaCutoffs.attentionBefore),
  }
}

async function fetchDocumentsByIds(collectionName, ids) {
  const uniqueIds = [...new Set(ids.filter(Boolean))]
  const chunks = []
  for (let index = 0; index < uniqueIds.length; index += MAX_IN_VALUES) {
    chunks.push(uniqueIds.slice(index, index + MAX_IN_VALUES))
  }

  const snapshots = await Promise.all(
    chunks.map((chunk) =>
      getDocs(query(collection(db, collectionName), where(documentId(), 'in', chunk))),
    ),
  )
  return snapshots.flatMap((snapshot) => snapshot.docs.map(normalize))
}

async function attachReferences(tickets) {
  if (tickets.length === 0) return []

  const [clients, pools] = await Promise.all([
    fetchDocumentsByIds(CLIENTS, tickets.map((ticket) => ticket.client_id)),
    fetchDocumentsByIds(POOLS, tickets.map((ticket) => ticket.pool_id)),
  ])
  const clientsById = new Map(clients.map((client) => [client.id, client]))
  const poolsById = new Map(pools.map((pool) => [pool.id, pool]))

  return tickets.map((ticket) => ({
    ...ticket,
    client: clientsById.get(ticket.client_id) ?? null,
    pool: poolsById.get(ticket.pool_id) ?? null,
  }))
}

export async function listTicketsPage({
  category = 'all',
  sla = 'all',
  cursor = null,
  slaCutoffs,
} = {}) {
  const constraints = queueConstraints({ category, sla, slaCutoffs })
  constraints.push(orderBy('created_at', 'asc'))
  if (cursor) constraints.push(startAfter(cursor))
  constraints.push(limit(TICKETS_PAGE_SIZE))

  const snapshot = await getDocs(query(collection(db, TICKETS), ...constraints))
  const documents = snapshot.docs

  return {
    items: await attachReferences(documents.map(normalize)),
    cursor: documents.length > 0 ? documents[documents.length - 1] : cursor,
    hasMore: documents.length === TICKETS_PAGE_SIZE,
  }
}

export async function getTicketById(ticketId) {
  const snapshot = await getDoc(doc(db, TICKETS, ticketId))
  if (!snapshot.exists()) return null
  const [ticket] = await attachReferences([normalize(snapshot)])
  return ticket
}

async function getLatestPoolReading(poolId) {
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

async function getAlertThresholds() {
  const snapshot = await getDoc(doc(db, SETTINGS, ALERT_THRESHOLDS))
  return snapshot.exists() ? normalize(snapshot) : null
}

async function countActivePools(clientId) {
  if (!clientId) return 0
  const result = await getCountFromServer(
    query(
      collection(db, POOLS),
      where('client_id', '==', clientId),
      where('is_active', '==', true),
    ),
  )
  return result.data().count
}

export async function listTicketAppointmentsPage(poolId, cursor = null) {
  if (!poolId) return { items: [], cursor: null, hasMore: false }

  const constraints = [
    where('pool_id', '==', poolId),
    where('status', '==', 'completed'),
    orderBy('date', 'desc'),
  ]
  if (cursor) constraints.push(startAfter(cursor))
  constraints.push(limit(TICKET_APPOINTMENTS_PAGE_SIZE))

  const snapshot = await getDocs(query(collection(db, APPOINTMENTS), ...constraints))
  const documents = snapshot.docs
  return {
    items: documents.map(normalize),
    cursor: documents.length > 0 ? documents[documents.length - 1] : cursor,
    hasMore: documents.length === TICKET_APPOINTMENTS_PAGE_SIZE,
  }
}

export async function getTicketDetail(ticketId) {
  const snapshot = await getDoc(doc(db, TICKETS, ticketId))
  if (!snapshot.exists()) return null

  const sourceTicket = normalize(snapshot)
  const [tickets, reading, alertThresholds, appointmentsPage, activePoolCount] = await Promise.all([
    attachReferences([sourceTicket]),
    sourceTicket.pool_id ? getLatestPoolReading(sourceTicket.pool_id) : null,
    getAlertThresholds(),
    listTicketAppointmentsPage(sourceTicket.pool_id),
    countActivePools(sourceTicket.client_id),
  ])
  const [ticket] = tickets

  return {
    ...ticket,
    poolReading: reading,
    alertThresholds,
    appointments: appointmentsPage.items,
    appointmentsCursor: appointmentsPage.cursor,
    appointmentsHasMore: appointmentsPage.hasMore,
    activePoolCount,
  }
}

async function countQueue(constraints = []) {
  const result = await getCountFromServer(query(collection(db, TICKETS), ...constraints))
  return result.data().count
}

export async function getTicketQueueStats(slaCutoffs) {
  const base = [where('status', 'in', OPEN_STATUSES)]
  const { criticalBefore, attentionBefore } = timestampCutoffs(slaCutoffs)

  const counts = await Promise.all([
    countQueue(base),
    ...TICKET_CATEGORIES.map((category) =>
      countQueue([...base, where('category', '==', category)]),
    ),
    countQueue([...base, where('created_at', '<=', criticalBefore)]),
    countQueue([
      ...base,
      where('created_at', '>', criticalBefore),
      where('created_at', '<=', attentionBefore),
    ]),
    countQueue([...base, where('created_at', '>', attentionBefore)]),
  ])

  return {
    open: counts[0],
    categories: {
      quote: counts[1],
      breakdown: counts[2],
      maintenance: counts[3],
    },
    sla: {
      critical: counts[4],
      attention: counts[5],
      regular: counts[6],
    },
  }
}

export async function listRecentRespondedTickets() {
  const snapshot = await getDocs(
    query(
      collection(db, TICKETS),
      where('status', '==', 'responded'),
      orderBy('responded_at', 'desc'),
      limit(TICKETS_PAGE_SIZE),
    ),
  )

  return snapshot.docs.map(normalize)
}

export async function listActiveClientsPage(cursor = null) {
  const constraints = [where('is_active', '==', true), orderBy(documentId(), 'asc')]
  if (cursor) constraints.push(startAfter(cursor))
  constraints.push(limit(CLIENTS_PAGE_SIZE))

  const snapshot = await getDocs(query(collection(db, CLIENTS), ...constraints))
  const documents = snapshot.docs
  return {
    items: documents.map(normalize),
    cursor: documents.length > 0 ? documents[documents.length - 1] : cursor,
    hasMore: documents.length === CLIENTS_PAGE_SIZE,
  }
}

export async function listPoolsByClient(clientId) {
  const snapshot = await getDocs(query(collection(db, POOLS), where('client_id', '==', clientId)))
  return snapshot.docs.map(normalize).filter((pool) => pool.is_active !== false)
}

export async function createTicket(payload) {
  const reference = await addDoc(collection(db, TICKETS), {
    ...payload,
    status: 'pending',
    priority: 'normal',
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  })

  return getTicketById(reference.id)
}

export async function updateTicketStatus(ticketId, status, responseMessage = '') {
  if (!['in_analysis', 'responded'].includes(status)) {
    throw new Error('Estado de ticket inválido.')
  }

  const expectedStatus = status === 'in_analysis' ? 'pending' : 'in_analysis'
  const update = { status, updated_at: serverTimestamp() }
  if (status === 'responded') {
    const message = responseMessage.trim()
    if (!message) throw new Error('A resposta ao cliente é obrigatória.')
    update.response_message = message
    update.responded_at = serverTimestamp()
  }

  const ticketRef = doc(db, TICKETS, ticketId)
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ticketRef)
    if (!snapshot.exists()) {
      const error = new Error('Pedido não encontrado.')
      error.code = 'ticket/not-found'
      throw error
    }

    if (snapshot.data().status !== expectedStatus) {
      const error = new Error('O estado do pedido foi alterado noutra sessão.')
      error.code = 'ticket/invalid-transition'
      throw error
    }

    transaction.update(ticketRef, update)
  })

  return getTicketById(ticketId)
}
