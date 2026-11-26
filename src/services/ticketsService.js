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
  serverTimestamp,
  startAfter,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../config/firebase'

const TICKETS = 'tickets'
const CLIENTS = 'clients'
const POOLS = 'pools'
const OPEN_STATUSES = ['pending', 'in_analysis']
const TICKET_CATEGORIES = ['quote', 'breakdown', 'maintenance']
const MAX_IN_VALUES = 30

export const TICKETS_PAGE_SIZE = 20
export const CLIENTS_PAGE_SIZE = 20

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

  const update = { status, updated_at: serverTimestamp() }
  if (status === 'responded') {
    const message = responseMessage.trim()
    if (!message) throw new Error('A resposta ao cliente é obrigatória.')
    update.response_message = message
    update.responded_at = serverTimestamp()
  }

  await updateDoc(doc(db, TICKETS, ticketId), update)
  return getTicketById(ticketId)
}
