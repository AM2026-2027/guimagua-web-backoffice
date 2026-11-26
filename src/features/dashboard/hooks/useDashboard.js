import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  countDashboardEntities,
  getAlertThresholds,
  getClientsByIds,
  getPoolsByIds,
  listActiveConsumables,
  listStaffUsers,
  subscribeOpenTickets,
  subscribeRecentPoolReadings,
  subscribeTodayAppointments,
} from '../../../services/dashboardService'
import { persistAlertThresholds } from './dashboardActions'
import {
  buildDailySchedule,
  buildPoolAlerts,
  computeFleetStability,
  getLowStockConsumables,
  latestReadingsByPool,
} from '../utils/alerts'
import { getDashboardErrorMessage } from '../utils/errors'
import { getLisbonDayBounds } from '../utils/labels'
import { DEFAULT_ALERT_THRESHOLDS } from '../utils/thresholdForm'

const EMPTY_STATIC = {
  key: null,
  staff: [],
  consumables: [],
  thresholds: null,
  counts: null,
  error: '',
}

const EMPTY_STREAM = { key: null, items: [], error: '' }

function mergeDocsIntoMap(prevMap, docs) {
  if (docs.length === 0) return prevMap
  const next = new Map(prevMap)
  for (const item of docs) next.set(item.id, item)
  return next
}

/**
 * Hook principal do Centro de Controlo & Despacho (`/dashboard`).
 * Combina leituras únicas para listas pequenas/agregados e 3 subscrições `onSnapshot`
 * limitadas com limpeza garantida (D-05, D-11, D-12, D-14).
 */
export function useDashboard({ adminUid } = {}) {
  const [reloadToken, setReloadToken] = useState(0)
  const [staticData, setStaticData] = useState(EMPTY_STATIC)
  const [appointmentsStream, setAppointmentsStream] = useState(EMPTY_STREAM)
  const [ticketsStream, setTicketsStream] = useState(EMPTY_STREAM)
  const [readingsStream, setReadingsStream] = useState(EMPTY_STREAM)
  const [poolsById, setPoolsById] = useState(() => new Map())
  const [clientsById, setClientsById] = useState(() => new Map())
  const [actionError, setActionError] = useState('')
  const [lastSyncedAt, setLastSyncedAt] = useState(null)

  // Regista IDs já pedidos nesta sessão para não repetir leituras em ciclo.
  const requestedPoolIdsRef = useRef(new Set())
  const requestedClientIdsRef = useRef(new Set())

  const { dayKey, dayStart, dayEnd } = useMemo(() => getLisbonDayBounds(), [])
  const loadKey = `${dayKey}:${reloadToken}`

  // 1. Leituras únicas: limiares de alerta, equipa ativa, consumíveis e contagens agregadas.
  useEffect(() => {
    let ignore = false
    async function loadStatic() {
      try {
        const [thresholds, staff, consumables, counts] = await Promise.all([
          getAlertThresholds(),
          listStaffUsers(),
          listActiveConsumables(),
          countDashboardEntities(),
        ])
        if (!ignore) {
          setStaticData({ key: loadKey, staff, consumables, thresholds, counts, error: '' })
          setLastSyncedAt(new Date())
        }
      } catch (error) {
        console.error(error)
        if (!ignore) {
          setStaticData({
            ...EMPTY_STATIC,
            key: loadKey,
            error: getDashboardErrorMessage(error, 'Não foi possível carregar os dados operacionais do dashboard.'),
          })
        }
      }
    }
    loadStatic()
    // Limpeza: ignora a resposta se o componente desmontar ou se for pedido novo recarregamento.
    return () => {
      ignore = true
    }
  }, [loadKey])

  // 2. Subscrições em tempo real (limpas ao desmontar ou quando muda `loadKey`).
  useEffect(() => {
    const { dayStart: start, dayEnd: end } = getLisbonDayBounds()

    const unsubscribeAppointments = subscribeTodayAppointments(
      start,
      end,
      (items) => {
        setAppointmentsStream({ key: loadKey, items, error: '' })
        setLastSyncedAt(new Date())
      },
      (error) => {
        console.error(error)
        setAppointmentsStream((prev) => ({
          ...prev,
          key: loadKey,
          error: getDashboardErrorMessage(error, 'Não foi possível subscrever os agendamentos de hoje.'),
        }))
      },
    )

    const unsubscribeTickets = subscribeOpenTickets(
      (items) => {
        setTicketsStream({ key: loadKey, items, error: '' })
        setLastSyncedAt(new Date())
      },
      (error) => {
        console.error(error)
        setTicketsStream((prev) => ({
          ...prev,
          key: loadKey,
          error: getDashboardErrorMessage(error, 'Não foi possível subscrever os pedidos em aberto.'),
        }))
      },
    )

    const unsubscribeReadings = subscribeRecentPoolReadings(
      (items) => {
        setReadingsStream({ key: loadKey, items, error: '' })
        setLastSyncedAt(new Date())
      },
      (error) => {
        console.error(error)
        setReadingsStream((prev) => ({
          ...prev,
          key: loadKey,
          error: getDashboardErrorMessage(error, 'Não foi possível subscrever as leituras das piscinas.'),
        }))
      },
    )

    // Limpeza obrigatória de todas as subscrições onSnapshot.
    return () => {
      unsubscribeAppointments()
      unsubscribeTickets()
      unsubscribeReadings()
    }
  }, [loadKey])

  // Última leitura por piscina (D-12) calculada a partir das leituras recentes subscritas.
  const latestReadings = useMemo(
    () => latestReadingsByPool(readingsStream.items),
    [readingsStream.items],
  )

  // 3. Resolução sob demanda (em lotes de 30) apenas das piscinas referenciadas nos alertas/tickets/agendamentos.
  const neededPoolIds = useMemo(() => {
    const ids = new Set()
    for (const reading of latestReadings) {
      if (reading.pool_id) ids.add(reading.pool_id)
    }
    for (const ticket of ticketsStream.items) {
      if (ticket.pool_id) ids.add(ticket.pool_id)
    }
    for (const appointment of appointmentsStream.items) {
      if (appointment.pool_id) ids.add(appointment.pool_id)
    }
    return [...ids]
  }, [latestReadings, ticketsStream.items, appointmentsStream.items])

  useEffect(() => {
    const missing = neededPoolIds.filter((id) => !requestedPoolIdsRef.current.has(id))
    if (missing.length === 0) return undefined
    missing.forEach((id) => requestedPoolIdsRef.current.add(id))

    let ignore = false
    getPoolsByIds(missing)
      .then((docs) => {
        if (!ignore) setPoolsById((prev) => mergeDocsIntoMap(prev, docs))
      })
      .catch((error) => console.error(error))

    return () => {
      ignore = true
    }
  }, [neededPoolIds])

  // Resolução sob demanda dos clientes associados às piscinas carregadas, tickets e agendamentos.
  const neededClientIds = useMemo(() => {
    const ids = new Set()
    for (const pool of poolsById.values()) {
      if (pool.client_id) ids.add(pool.client_id)
    }
    for (const ticket of ticketsStream.items) {
      if (ticket.client_id) ids.add(ticket.client_id)
    }
    for (const appointment of appointmentsStream.items) {
      if (appointment.client_id) ids.add(appointment.client_id)
    }
    return [...ids]
  }, [poolsById, ticketsStream.items, appointmentsStream.items])

  useEffect(() => {
    const missing = neededClientIds.filter((id) => !requestedClientIdsRef.current.has(id))
    if (missing.length === 0) return undefined
    missing.forEach((id) => requestedClientIdsRef.current.add(id))

    let ignore = false
    getClientsByIds(missing)
      .then((docs) => {
        if (!ignore) setClientsById((prev) => mergeDocsIntoMap(prev, docs))
      })
      .catch((error) => console.error(error))

    return () => {
      ignore = true
    }
  }, [neededClientIds])

  const thresholds = staticData.thresholds ?? DEFAULT_ALERT_THRESHOLDS

  // Cálculos derivados no cliente (zero leituras extra ao editar os limiares).
  const poolAlerts = useMemo(
    () => buildPoolAlerts(latestReadings, thresholds, poolsById, clientsById),
    [latestReadings, thresholds, poolsById, clientsById],
  )

  const lowStockConsumables = useMemo(
    () => getLowStockConsumables(staticData.consumables),
    [staticData.consumables],
  )

  const fleetStability = useMemo(
    () => computeFleetStability(latestReadings, thresholds),
    [latestReadings, thresholds],
  )

  const dailySchedule = useMemo(
    () => buildDailySchedule(staticData.staff, appointmentsStream.items),
    [staticData.staff, appointmentsStream.items],
  )

  const reload = useCallback(() => {
    requestedPoolIdsRef.current.clear()
    requestedClientIdsRef.current.clear()
    setReloadToken((token) => token + 1)
  }, [])

  const clearActionError = useCallback(() => setActionError(''), [])

  async function saveThresholds(payload) {
    setActionError('')
    try {
      const saved = await persistAlertThresholds(payload, adminUid)
      setStaticData((prev) => ({
        ...prev,
        thresholds: { ...(prev.thresholds ?? {}), ...saved },
      }))
      setLastSyncedAt(new Date())
      return true
    } catch (error) {
      console.error(error)
      setActionError(getDashboardErrorMessage(error, 'Não foi possível guardar os limiares de alerta.'))
      return false
    }
  }

  const loading =
    staticData.key !== loadKey ||
    appointmentsStream.key !== loadKey ||
    ticketsStream.key !== loadKey ||
    readingsStream.key !== loadKey

  const streamErrors = [appointmentsStream.error, ticketsStream.error, readingsStream.error].filter(Boolean)

  return {
    dayStart,
    dayEnd,
    loading,
    error: loading ? '' : staticData.error,
    streamErrors,
    counts: staticData.counts,
    thresholds,
    hasSavedThresholds: Boolean(staticData.thresholds),
    staff: staticData.staff,
    appointments: appointmentsStream.items,
    tickets: ticketsStream.items,
    poolAlerts,
    lowStockConsumables,
    fleetStability,
    dailySchedule,
    poolsById,
    clientsById,
    lastSyncedAt,
    actionError,
    clearActionError,
    saveThresholds,
    reload,
  }
}
