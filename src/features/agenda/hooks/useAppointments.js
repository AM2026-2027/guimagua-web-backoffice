import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  listAgendaServices,
  listAgendaStaff,
  listClientsByIds,
  listPoolsByIds,
  subscribeAppointmentsForDay,
} from '../../../services/agendaService'
import { getAgendaErrorMessage } from '../utils/errors'

const EMPTY_SCHEDULE = { dateKey: null, items: [], error: '' }
const EMPTY_ITEMS = []

export function useAppointments(dateKey) {
  const [schedule, setSchedule] = useState(EMPTY_SCHEDULE)
  const [staff, setStaff] = useState([])
  const [services, setServices] = useState([])
  const [poolsById, setPoolsById] = useState({})
  const [clientsById, setClientsById] = useState({})
  const [metadataError, setMetadataError] = useState('')
  const [referencesError, setReferencesError] = useState('')
  const [metadataLoading, setMetadataLoading] = useState(true)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let ignore = false
    async function loadMetadata() {
      try {
        const [loadedStaff, loadedServices] = await Promise.all([
          listAgendaStaff(),
          listAgendaServices(),
        ])
        if (!ignore) {
          setStaff(loadedStaff)
          setServices(loadedServices)
          setMetadataError('')
        }
      } catch (error) {
        console.error(error)
        if (!ignore) setMetadataError(getAgendaErrorMessage(error, 'Não foi possível carregar técnicos e serviços.'))
      } finally {
        if (!ignore) setMetadataLoading(false)
      }
    }

    loadMetadata()
    // Limpeza: ignora a resposta se a página sair antes de carregar os dados de referência.
    return () => {
      ignore = true
    }
  }, [])

  const scheduleKey = `${dateKey}:${reloadToken}`

  useEffect(() => {
    const unsubscribe = subscribeAppointmentsForDay(
      dateKey,
      (items) => {
        setReferencesError('')
        setSchedule({ dateKey: scheduleKey, items, error: '' })
      },
      (error) => {
        console.error(error)
        setSchedule({
          dateKey: scheduleKey,
          items: [],
          error: getAgendaErrorMessage(error),
        })
      },
    )
    // Limpeza: remove a subscrição do dia anterior ou quando a página desmonta.
    return unsubscribe
  }, [dateKey, reloadToken, scheduleKey])

  const scheduleItems = useMemo(
    () => (schedule.dateKey === scheduleKey ? schedule.items : EMPTY_ITEMS),
    [schedule.dateKey, schedule.items, scheduleKey],
  )
  const poolIdsKey = useMemo(
    () => [...new Set(scheduleItems.map((appointment) => appointment.pool_id).filter(Boolean))].sort().join('|'),
    [scheduleItems],
  )

  useEffect(() => {
    const poolIds = poolIdsKey ? poolIdsKey.split('|') : []
    const missingPoolIds = poolIds.filter((id) => !Object.prototype.hasOwnProperty.call(poolsById, id))
    if (missingPoolIds.length === 0) return undefined

    let ignore = false
    async function loadPools() {
      try {
        const loadedPools = await listPoolsByIds(missingPoolIds)
        if (ignore) return

        const foundPools = Object.fromEntries(loadedPools.map((pool) => [pool.id, pool]))
        setPoolsById((previous) => ({
          ...previous,
          ...Object.fromEntries(missingPoolIds.map((id) => [id, foundPools[id] ?? null])),
        }))
        setReferencesError('')
      } catch (error) {
        console.error(error)
        if (!ignore) setReferencesError(getAgendaErrorMessage(error, 'Não foi possível carregar piscinas.'))
      }
    }

    loadPools()
    // Limpeza: ignora referências de uma data anterior se a navegação mudar durante a consulta.
    return () => {
      ignore = true
    }
  }, [poolIdsKey, poolsById, reloadToken])

  const clientIdsKey = useMemo(() => {
    const poolIds = poolIdsKey ? poolIdsKey.split('|') : []
    return [
      ...new Set(
        poolIds
          .map((id) => poolsById[id]?.client_id)
          .filter(Boolean),
      ),
    ]
      .sort()
      .join('|')
  }, [poolIdsKey, poolsById])

  useEffect(() => {
    const clientIds = clientIdsKey ? clientIdsKey.split('|') : []
    const missingClientIds = clientIds.filter(
      (id) => !Object.prototype.hasOwnProperty.call(clientsById, id),
    )
    if (missingClientIds.length === 0) return undefined

    let ignore = false
    async function loadClients() {
      try {
        const loadedClients = await listClientsByIds(missingClientIds)
        if (ignore) return
        const foundClients = Object.fromEntries(loadedClients.map((client) => [client.id, client]))
        setClientsById((previous) => ({
          ...previous,
          ...Object.fromEntries(missingClientIds.map((id) => [id, foundClients[id] ?? null])),
        }))
        setReferencesError('')
      } catch (error) {
        console.error(error)
        if (!ignore) setReferencesError(getAgendaErrorMessage(error, 'Não foi possível carregar clientes.'))
      }
    }

    loadClients()
    // Limpeza: ignora clientes referenciados por uma data anterior se a navegação mudar durante a consulta.
    return () => {
      ignore = true
    }
  }, [clientIdsKey, clientsById, reloadToken])

  const loading = schedule.dateKey !== scheduleKey || metadataLoading
  const error =
    (schedule.dateKey === scheduleKey ? schedule.error : '') || metadataError || referencesError
  const reload = useCallback(async () => {
    setReloadToken((token) => token + 1)
    setMetadataLoading(true)
    try {
      const [loadedStaff, loadedServices] = await Promise.all([
        listAgendaStaff(),
        listAgendaServices(),
      ])
      setStaff(loadedStaff)
      setServices(loadedServices)
      setMetadataError('')
    } catch (error) {
      console.error(error)
      setMetadataError(getAgendaErrorMessage(error, 'Não foi possível carregar técnicos e serviços.'))
    } finally {
      setMetadataLoading(false)
    }
  }, [])

  return {
    appointments: scheduleItems,
    staff,
    services,
    poolsById,
    clientsById,
    loading,
    error,
    reload,
  }
}
