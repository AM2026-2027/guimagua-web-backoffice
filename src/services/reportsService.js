import {
  collection,
  documentId,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  Timestamp,
  where,
} from 'firebase/firestore'
import { db } from '../config/firebase'

const APPOINTMENTS = 'appointments'
const CLIENTS = 'clients'
const POOLS = 'pools'
const POOL_READINGS = 'pool_readings'
const SERVICES = 'services'
const USERS = 'users'
const IN_QUERY_MAX = 30

function normalize(snapshot) {
  return { id: snapshot.id, ...snapshot.data() }
}

function uniqueIds(items, field) {
  return [...new Set(items.map((item) => item[field]).filter(Boolean))]
}

function chunksOf(values, size = IN_QUERY_MAX) {
  const chunks = []
  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size))
  }
  return chunks
}

function timestampMillis(value) {
  if (!value) return 0
  if (typeof value.toMillis === 'function') return value.toMillis()
  if (typeof value.toDate === 'function') return value.toDate().getTime()
  return new Date(value).getTime() || 0
}

function latestReadingsByAppointment(readings) {
  const latest = new Map()
  for (const reading of readings) {
    const current = latest.get(reading.appointment_id)
    if (!current || timestampMillis(reading.timestamp) > timestampMillis(current.timestamp)) {
      latest.set(reading.appointment_id, reading)
    }
  }
  return latest
}

function periodConstraints(period, field) {
  return [
    where(field, '>=', Timestamp.fromDate(period.start)),
    where(field, '<', Timestamp.fromDate(period.endExclusive)),
  ]
}

async function getDocumentsByIds(collectionName, ids) {
  if (ids.length === 0) return []
  const snapshots = await Promise.all(
    chunksOf(ids).map((chunk) =>
      getDocs(query(collection(db, collectionName), where(documentId(), 'in', chunk))),
    ),
  )
  return snapshots.flatMap((snapshot) => snapshot.docs.map(normalize))
}

export async function getReportLookups() {
  const [servicesSnapshot, usersSnapshot] = await Promise.all([
    getDocs(collection(db, SERVICES)),
    getDocs(query(collection(db, USERS), where('role', 'in', ['technician', 'commercial']))),
  ])
  return {
    services: servicesSnapshot.docs.map(normalize),
    staff: usersSnapshot.docs.map(normalize),
  }
}

export async function listReportsPage({
  period,
  technicianId = 'all',
  serviceIds = null,
  pageSize = 7,
  cursor = null,
}) {
  if (serviceIds && serviceIds.length === 0) {
    return { items: [], cursor, hasMore: false }
  }
  if (serviceIds && serviceIds.length > IN_QUERY_MAX) {
    throw new Error('O filtro de tipo inclui demasiados serviços para uma consulta Firestore.')
  }

  const constraints = [
    where('status', '==', 'completed'),
    ...periodConstraints(period, 'date'),
  ]
  if (technicianId !== 'all') constraints.push(where('tech_id', '==', technicianId))
  if (serviceIds) constraints.push(where('service_id', 'in', serviceIds))
  constraints.push(orderBy('date', 'desc'))
  if (cursor) constraints.push(startAfter(cursor))
  constraints.push(limit(pageSize))

  const snapshot = await getDocs(query(collection(db, APPOINTMENTS), ...constraints))
  const appointments = snapshot.docs.map(normalize)
  const clientIds = uniqueIds(appointments, 'client_id')
  const poolIds = uniqueIds(appointments, 'pool_id')
  const appointmentIds = appointments.map((appointment) => appointment.id)

  const [clients, pools, readings] = await Promise.all([
    getDocumentsByIds(CLIENTS, clientIds),
    getDocumentsByIds(POOLS, poolIds),
    appointmentIds.length > 0
      ? Promise.all(
          chunksOf(appointmentIds).map((chunk) =>
            getDocs(query(collection(db, POOL_READINGS), where('appointment_id', 'in', chunk))),
          ),
        ).then((snapshots) => snapshots.flatMap((result) => result.docs.map(normalize)))
      : Promise.resolve([]),
  ])

  const clientsById = new Map(clients.map((client) => [client.id, client]))
  const poolsById = new Map(pools.map((pool) => [pool.id, pool]))
  const latestReadings = latestReadingsByAppointment(readings)
  const nextCursor = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : cursor

  return {
    items: appointments.map((appointment) => ({
      ...appointment,
      client: clientsById.get(appointment.client_id) ?? null,
      pool: poolsById.get(appointment.pool_id) ?? null,
      latestReading: latestReadings.get(appointment.id) ?? null,
    })),
    cursor: nextCursor,
    hasMore: snapshot.docs.length === pageSize,
  }
}

export async function countReports(period, { technicianId = 'all', serviceIds = null } = {}) {
  if (serviceIds && serviceIds.length === 0) return { completed: 0, pdfAvailable: 0 }
  if (serviceIds && serviceIds.length > IN_QUERY_MAX) {
    throw new Error('O filtro de tipo inclui demasiados serviços para uma consulta Firestore.')
  }

  const constraints = [
    where('status', '==', 'completed'),
    ...periodConstraints(period, 'date'),
  ]
  if (technicianId !== 'all') constraints.push(where('tech_id', '==', technicianId))
  if (serviceIds) constraints.push(where('service_id', 'in', serviceIds))
  const [completed, pdfAvailable] = await Promise.all([
    getCountFromServer(query(collection(db, APPOINTMENTS), ...constraints)),
    getCountFromServer(
      query(collection(db, APPOINTMENTS), ...constraints, where('report_pdf_path', '!=', null)),
    ),
  ])
  return {
    completed: completed.data().count,
    pdfAvailable: pdfAvailable.data().count,
  }
}

export async function countPoolReadings(period) {
  const snapshot = await getCountFromServer(
    query(collection(db, POOL_READINGS), ...periodConstraints(period, 'timestamp')),
  )
  return snapshot.data().count
}
