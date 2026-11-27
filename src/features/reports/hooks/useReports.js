import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  countPoolReadings,
  countReports,
  getReportLookups,
  listReportsPage,
} from '../../../services/reportsService'
import { getDefaultReportPeriod, isValidReportPeriod, toFirestorePeriod } from '../utils/dateRange'
import { getReportsErrorMessage } from '../utils/errors'
import { filterReportsBySearch } from '../utils/search'

const PAGE_SIZE_OPTIONS = [7, 15, 30]

const EMPTY_PAGE_STATE = {
  key: null,
  pages: [],
  pageIndex: 0,
  loading: true,
  loadingMore: false,
  error: '',
}

export function useReports() {
  const [period, setPeriod] = useState(getDefaultReportPeriod)
  const [type, setType] = useState('all')
  const [technicianId, setTechnicianId] = useState('all')
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0])
  const [searchTerm, setSearchTerm] = useState('')
  const [reloadToken, setReloadToken] = useState(0)
  const [lookups, setLookups] = useState({ services: [], staff: [], loading: true, error: '' })
  const [pageState, setPageState] = useState(EMPTY_PAGE_STATE)
  const [summary, setSummary] = useState({ key: null, counts: null, loading: true, error: '' })

  useEffect(() => {
    let ignore = false
    async function loadLookups() {
      try {
        const result = await getReportLookups()
        if (!ignore) setLookups({ ...result, loading: false, error: '' })
      } catch (error) {
        console.error(error)
        if (!ignore) {
          setLookups({
            services: [],
            staff: [],
            loading: false,
            error: getReportsErrorMessage(error, 'Não foi possível carregar os tipos de serviço e técnicos.'),
          })
        }
      }
    }
    loadLookups()
    // Limpeza: descarta a resposta se o ecrã sair antes de os catálogos carregarem.
    return () => {
      ignore = true
    }
  }, [reloadToken])

  const servicesById = useMemo(() => new Map(lookups.services.map((service) => [service.id, service])), [lookups.services])
  const staffById = useMemo(() => new Map(lookups.staff.map((user) => [user.id, user])), [lookups.staff])
  const serviceIds = useMemo(() => {
    if (type === 'all') return null
    return lookups.services.filter((service) => service.type === type).map((service) => service.id)
  }, [lookups.services, type])
  const serviceIdsKey = serviceIds ? serviceIds.join(',') : 'all'
  const validPeriod = isValidReportPeriod(period)
  const queryKey = JSON.stringify({
    period,
    technicianId,
    type,
    serviceIdsKey,
    pageSize,
    reloadToken,
  })
  const summaryKey = JSON.stringify({ period, reloadToken })

  useEffect(() => {
    if (lookups.loading || lookups.error || !validPeriod) return undefined
    let ignore = false
    async function loadFirstPage() {
      setPageState({ ...EMPTY_PAGE_STATE, key: queryKey })
      try {
        const page = await listReportsPage({
          period: toFirestorePeriod(period),
          technicianId,
          serviceIds,
          pageSize,
        })
        const items = page.items.map((appointment) => ({
          ...appointment,
          service: servicesById.get(appointment.service_id) ?? null,
          technician: staffById.get(appointment.tech_id) ?? null,
        }))
        if (!ignore) {
          setPageState({
            key: queryKey,
            pages: [{ ...page, items }],
            pageIndex: 0,
            loading: false,
            loadingMore: false,
            error: '',
          })
        }
      } catch (error) {
        console.error(error)
        if (!ignore) {
          setPageState({
            ...EMPTY_PAGE_STATE,
            key: queryKey,
            loading: false,
            error: getReportsErrorMessage(error, 'Não foi possível carregar as intervenções concluídas.'),
          })
        }
      }
    }
    loadFirstPage()
    // Limpeza: evita que uma consulta de filtros anteriores substitua os resultados atuais.
    return () => {
      ignore = true
    }
  }, [lookups.loading, lookups.error, validPeriod, queryKey, period, technicianId, serviceIds, pageSize, servicesById, staffById])



  useEffect(() => {
    if (!validPeriod) return undefined
    let ignore = false
    async function loadSummary() {
      setSummary({ key: summaryKey, counts: null, loading: true, error: '' })
      try {
        const periodBounds = toFirestorePeriod(period)
        const [reports, readings] = await Promise.all([
          countReports(periodBounds),
          countPoolReadings(periodBounds),
        ])
        if (!ignore) {
          setSummary({
            key: summaryKey,
            counts: { ...reports, readings },
            loading: false,
            error: '',
          })
        }
      } catch (error) {
        console.error(error)
        if (!ignore) {
          setSummary({
            key: summaryKey,
            counts: null,
            loading: false,
            error: getReportsErrorMessage(error, 'Não foi possível carregar os totais do período.'),
          })
        }
      }
    }
    loadSummary()
    // Limpeza: ignora totais de um período anterior quando o intervalo muda.
    return () => {
      ignore = true
    }
  }, [validPeriod, summaryKey, period])

  const currentPage = pageState.key === queryKey ? pageState.pages[pageState.pageIndex] : null
  const visibleReports = useMemo(
    () => filterReportsBySearch(currentPage?.items ?? [], searchTerm),
    [currentPage, searchTerm],
  )
  const counts = summary.key === summaryKey ? summary.counts : null
  const totalPages = counts ? Math.ceil(counts.completed / pageSize) : 0
  const loading = lookups.loading || pageState.key !== queryKey || pageState.loading
  const summaryLoading = summary.key !== summaryKey || summary.loading

  const loadNextPage = useCallback(async () => {
    if (!currentPage?.hasMore || pageState.loadingMore || loading) return
    if (pageState.pageIndex < pageState.pages.length - 1) {
      setPageState((previous) => ({ ...previous, pageIndex: previous.pageIndex + 1 }))
      return
    }

    setPageState((previous) => ({ ...previous, loadingMore: true, error: '' }))
    try {
      const page = await listReportsPage({
        period: toFirestorePeriod(period),
        technicianId,
        serviceIds,
        pageSize,
        cursor: currentPage.cursor,
      })
      const items = page.items.map((appointment) => ({
        ...appointment,
        service: servicesById.get(appointment.service_id) ?? null,
        technician: staffById.get(appointment.tech_id) ?? null,
      }))
      setPageState((previous) => {
        if (previous.key !== queryKey) return previous
        return {
          ...previous,
          pages: [...previous.pages, { ...page, items }],
          pageIndex: previous.pageIndex + 1,
          loadingMore: false,
        }
      })
    } catch (error) {
      console.error(error)
      setPageState((previous) => ({
        ...previous,
        loadingMore: false,
        error: getReportsErrorMessage(error, 'Não foi possível carregar a página seguinte.'),
      }))
    }
  }, [currentPage, pageState.loadingMore, pageState.pageIndex, pageState.pages.length, loading, period, technicianId, serviceIds, pageSize, servicesById, staffById, queryKey])

  const loadPreviousPage = useCallback(() => {
    setPageState((previous) => ({
      ...previous,
      pageIndex: Math.max(0, previous.pageIndex - 1),
    }))
  }, [])

  const resetFilters = useCallback(() => {
    setPeriod(getDefaultReportPeriod())
    setType('all')
    setTechnicianId('all')
    setPageSize(PAGE_SIZE_OPTIONS[0])
    setSearchTerm('')
  }, [])

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1)
  }, [])

  return {
    period,
    setPeriod,
    validPeriod,
    type,
    setType,
    technicianId,
    setTechnicianId,
    pageSize,
    setPageSize,
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    searchTerm,
    setSearchTerm,
    services: lookups.services,
    technicians: lookups.staff.filter((user) => user.role === 'technician'),
    loading,
    loadingMore: pageState.loadingMore,
    error: lookups.error || (pageState.key === queryKey ? pageState.error : ''),
    summaryLoading,
    summaryError: summary.key === summaryKey ? summary.error : '',
    counts,
    visibleReports,
    pageItemCount: currentPage?.items.length ?? 0,
    totalCount: counts?.completed ?? null,
    pageNumber: pageState.pageIndex + 1,
    totalPages,
    hasPreviousPage: pageState.pageIndex > 0,
    hasNextPage: Boolean(currentPage?.hasMore),
    loadPreviousPage,
    loadNextPage,
    resetFilters,
    reload,
  }
}
