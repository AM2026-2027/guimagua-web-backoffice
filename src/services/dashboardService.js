import {
  Timestamp,
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
  setDoc,
  where,
} from 'firebase/firestore'
import { db } from '../config/firebase'

const SETTINGS = 'settings'
const ALERT_THRESHOLDS_DOC = 'alert_thresholds'
const TICKETS = 'tickets'
const APPOINTMENTS = 'appointments'
const POOL_READINGS = 'pool_readings'
const CONSUMABLES = 'consumables'
const CLIENTS = 'clients'
const POOLS = 'pools'
const USERS = 'users'

const LISBON_TIMEZONE = 'Europe/Lisbon'
// O operador `in` do Firestore aceita no máximo 30 valores por consulta.
const IN_QUERY_MAX = 30
const RECENT_TICKETS_LIMIT = 5
const TODAY_APPOINTMENTS_LIMIT = 50
const CONSUMABLES_LIMIT = 200
const POOL_READINGS_LIMIT = 100

function normalize(snapshot) {
  return { id: snapshot.id, ...snapshot.data() }
}

/**
 * Calcula o deslocamento UTC (em ms) para o fuso horário indicado numa determinada data,
 * garantindo limites de dia exatos em `Europe/Lisbon` mesmo em mudanças de hora (WET/WEST).
 */
function getTimeZoneOffsetMs(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date)

  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  const hour = Number(map.hour) === 24 ? 0 : Number(map.hour)
  const utcEquivalent = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    hour,
    Number(map.minute),
    Number(map.second),
  )
  return utcEquivalent - date.getTime()
}

function zonedWallClockToDate(year, month, day, hour, minute, second, ms, timeZone) {
  const approxUtc = new Date(Date.UTC(year, month - 1, day, hour, minute, second, ms))
  const firstOffset = getTimeZoneOffsetMs(approxUtc, timeZone)
  const firstPass = new Date(approxUtc.getTime() - firstOffset)
  const secondOffset = getTimeZoneOffsetMs(firstPass, timeZone)
  return new Date(approxUtc.getTime() - secondOffset)
}

/** Devolve os timestamps de início (00:00:00.000) e fim (23:59:59.999) do dia atual em `Europe/Lisbon`. */
function getLisbonTodayBounds(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: LISBON_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  const year = Number(map.year)
  const month = Number(map.month)
  const day = Number(map.day)

  const start = zonedWallClockToDate(year, month, day, 0, 0, 0, 0, LISBON_TIMEZONE)
  const end = zonedWallClockToDate(year, month, day, 23, 59, 59, 999, LISBON_TIMEZONE)
  return {
    startTs: Timestamp.fromDate(start),
    endTs: Timestamp.fromDate(end),
  }
}

/** Carrega documentos por uma lista de IDs em lotes de até 30 para poupar leituras ao Firestore. */
async function fetchDocsMapByIds(collectionName, ids) {
  const uniqueIds = [...new Set(ids.filter((id) => typeof id === 'string' && id.trim().length > 0))]
  if (uniqueIds.length === 0) return {}

  const chunks = []
  for (let index = 0; index < uniqueIds.length; index += IN_QUERY_MAX) {
    chunks.push(uniqueIds.slice(index, index + IN_QUERY_MAX))
  }

  const snapshots = await Promise.all(
    chunks.map((chunk) => getDocs(query(collection(db, collectionName), where(documentId(), 'in', chunk)))),
  )

  const result = {}
  snapshots.forEach((snapshot) => {
    snapshot.docs.forEach((docSnap) => {
      result[docSnap.id] = normalize(docSnap)
    })
  })
  return result
}

/** Lê os limiares de alerta configurados pelo administrador em `settings/alert_thresholds` (D-11). */
export async function getAlertThresholds() {
  const snapshot = await getDoc(doc(db, SETTINGS, ALERT_THRESHOLDS_DOC))
  return snapshot.exists() ? normalize(snapshot) : null
}

/** Grava os limiares de alerta em `settings/alert_thresholds` com auditoria (`updated_by`, `serverTimestamp`). */
export async function saveAlertThresholds(payload, adminUid) {
  await setDoc(
    doc(db, SETTINGS, ALERT_THRESHOLDS_DOC),
    {
      ...payload,
      updated_by: adminUid ?? null,
      updated_at: serverTimestamp(),
    },
    { merge: true },
  )
}

/**
 * Carregamento agregado e otimizado para o Dashboard (RF-WEB05, D-05, D-11, D-12):
 * usa agregações no servidor (`getCountFromServer`) e queries limitadas para caber nas quotas gratuitas.
 */
export async function getDashboardSnapshot() {
  const { startTs, endTs } = getLisbonTodayBounds()

  const [
    thresholds,
    activeClientsCountSnap,
    openTicketsCountSnap,
    recentTicketsSnap,
    todayAppointmentsSnap,
    staffUsersSnap,
    activeConsumablesSnap,
    recentReadingsSnap,
  ] = await Promise.all([
    getAlertThresholds(),
    getCountFromServer(query(collection(db, CLIENTS), where('is_active', '==', true))),
    getCountFromServer(query(collection(db, TICKETS), where('status', 'in', ['pending', 'in_analysis']))),
    getDocs(query(collection(db, TICKETS), orderBy('created_at', 'desc'), limit(RECENT_TICKETS_LIMIT))),
    getDocs(
      query(
        collection(db, APPOINTMENTS),
        where('date', '>=', startTs),
        where('date', '<=', endTs),
        orderBy('date', 'asc'),
        limit(TODAY_APPOINTMENTS_LIMIT),
      ),
    ),
    getDocs(query(collection(db, USERS), where('role', 'in', ['technician', 'commercial']))),
    getDocs(query(collection(db, CONSUMABLES), where('is_active', '==', true), limit(CONSUMABLES_LIMIT))),
    getDocs(query(collection(db, POOL_READINGS), orderBy('timestamp', 'desc'), limit(POOL_READINGS_LIMIT))),
  ])

  const recentTickets = recentTicketsSnap.docs.map(normalize)
  const todayAppointments = todayAppointmentsSnap.docs.map(normalize)
  // Filtragem de utilizadores ativos no cliente para evitar exigir um índice composto extra.
  const staffUsers = staffUsersSnap.docs.map(normalize).filter((user) => user.is_active !== false)
  const activeConsumables = activeConsumablesSnap.docs.map(normalize)

  // D-12: um alerta corresponde à leitura mais recente de cada piscina (a query já vem ordenada por `timestamp` desc).
  const latestByPool = new Map()
  recentReadingsSnap.docs.forEach((docSnap) => {
    const reading = normalize(docSnap)
    if (reading.pool_id && !latestByPool.has(reading.pool_id)) {
      latestByPool.set(reading.pool_id, reading)
    }
  })
  const latestReadings = [...latestByPool.values()]

  // Carrega apenas as piscinas e clientes efetivamente referenciados nos blocos visíveis.
  const referencedPoolIds = [
    ...latestReadings.map((reading) => reading.pool_id),
    ...todayAppointments.map((appointment) => appointment.pool_id),
    ...recentTickets.map((ticket) => ticket.pool_id),
  ]
  const poolsById = await fetchDocsMapByIds(POOLS, referencedPoolIds)

  const referencedClientIds = [
    ...recentTickets.map((ticket) => ticket.client_id),
    ...todayAppointments.map((appointment) => appointment.client_id),
    ...Object.values(poolsById).map((pool) => pool.client_id),
  ]
  const clientsById = await fetchDocsMapByIds(CLIENTS, referencedClientIds)

  const staffById = Object.fromEntries(staffUsers.map((member) => [member.id, member]))

  return {
    thresholds,
    activeClientsCount: activeClientsCountSnap.data().count,
    openTicketsCount: openTicketsCountSnap.data().count,
    recentTickets,
    todayAppointments,
    staffById,
    activeConsumables,
    latestReadings,
    poolsById,
    clientsById,
    fetchedAt: new Date().toISOString(),
  }
}
