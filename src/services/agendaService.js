import {
  Timestamp,
  collection,
  doc,
  documentId,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
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
const IN_QUERY_MAX = 30

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
