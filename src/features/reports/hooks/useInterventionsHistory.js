import { useCallback, useEffect, useMemo, useState } from 'react'
import { listInterventionsPage } from '../../../services/reportsService'
import { getReportsErrorMessage } from '../utils/errors'
import { decorateAppointment } from '../utils/interventions'
import { fetchMissingLocations, mergeIntoMap } from './locationLookups'

const EMPTY_LIST = { key: null, items: [], cursor: null, hasMore: false, error: '' }

/**
 * Histórico de intervenções com paginação por cursor (RNF-WEB02).
 * `filters`: { includeCancelled, startMs, endMs, techId, poolId } — qualquer mudança volta à primeira página.
 * `reference`: { staffById, servicesById } de useReferenceData, para os nomes.
 */
export function useInterventionsHistory(filters, reference) {
  const [reloadToken, setReloadToken] = useState(0)
  const [list, setList] = useState(EMPTY_LIST)
  const [locations, setLocations] = useState({ pools: new Map(), clients: new Map() })
  const [loadingMore, setLoadingMore] = useState(false)
  const [moreError, setMoreError] = useState('')

  const statuses = useMemo(() => (filters.includeCancelled ? ['completed', 'cancelled'] : ['completed']), [filters.includeCancelled])
  const key = `${statuses.join(',')}|${filters.startMs ?? ''}|${filters.endMs ?? ''}|${filters.techId ?? ''}|${filters.poolId ?? ''}|${reloadToken}`

  const query = useMemo(
    () => ({ statuses, startMs: filters.startMs, endMs: filters.endMs, techId: filters.techId, poolId: filters.poolId }),
    [statuses, filters.startMs, filters.endMs, filters.techId, filters.poolId],
  )

  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        const page = await listInterventionsPage(query)
        // Na primeira página lê as piscinas e os clientes dessa página (a cache não entra nas dependências do
        // efeito, para não voltar a disparar a leitura); nas páginas seguintes só se leem os que faltam.
        const missing = await fetchMissingLocations(page.items, { pools: new Map(), clients: new Map() })
        if (ignore) return
        setLocations((prev) => ({ pools: mergeIntoMap(prev.pools, missing.pools), clients: mergeIntoMap(prev.clients, missing.clients) }))
        setList({ key, ...page, error: '' })
      } catch (error) {
        console.error(error)
        if (!ignore) setList({ ...EMPTY_LIST, key, error: getReportsErrorMessage(error, 'Não foi possível carregar o histórico de intervenções.') })
      }
    }
    load()
    // Limpeza: se os filtros mudarem antes da resposta, a resposta antiga é ignorada.
    return () => {
      ignore = true
    }
  }, [key, query])

  const loading = list.key !== key

  async function loadMore() {
    if (!list.hasMore || loadingMore) return
    setLoadingMore(true)
    setMoreError('')
    try {
      const page = await listInterventionsPage({ ...query, cursor: list.cursor })
      const missing = await fetchMissingLocations(page.items, locations)
      setLocations((prev) => ({ pools: mergeIntoMap(prev.pools, missing.pools), clients: mergeIntoMap(prev.clients, missing.clients) }))
      setList((prev) => ({
        ...prev,
        items: [...prev.items, ...page.items.filter((item) => !prev.items.some((existing) => existing.id === item.id))],
        cursor: page.cursor,
        hasMore: page.hasMore,
      }))
    } catch (error) {
      console.error(error)
      setMoreError(getReportsErrorMessage(error, 'Não foi possível carregar mais intervenções.'))
    } finally {
      setLoadingMore(false)
    }
  }

  const rows = useMemo(() => {
    const lookups = { pools: locations.pools, clients: locations.clients, staff: reference.staffById, services: reference.servicesById }
    return list.items.map((item) => decorateAppointment(item, lookups))
  }, [list.items, locations, reference.staffById, reference.servicesById])

  const reload = useCallback(() => setReloadToken((token) => token + 1), [])

  return {
    rows: loading ? [] : rows,
    loading,
    error: loading ? '' : list.error,
    hasMore: list.hasMore,
    loadingMore,
    moreError,
    loadMore,
    reload,
    pools: locations.pools,
  }
}
