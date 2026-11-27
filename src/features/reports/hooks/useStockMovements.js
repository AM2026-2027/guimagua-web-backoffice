import { useCallback, useEffect, useMemo, useState } from 'react'
import { listStockMovementsPage } from '../../../services/reportsService'
import { getReportsErrorMessage } from '../utils/errors'

const EMPTY_LIST = { key: null, items: [], cursor: null, hasMore: false, error: '' }

/**
 * Registo de movimentos de stock do inventário, com paginação por cursor.
 * `filters`: { type: '' | 'in' | 'out', startMs, endMs } — qualquer mudança volta à primeira página.
 */
export function useStockMovements(filters) {
  const [reloadToken, setReloadToken] = useState(0)
  const [list, setList] = useState(EMPTY_LIST)
  const [loadingMore, setLoadingMore] = useState(false)
  const [moreError, setMoreError] = useState('')

  const query = useMemo(
    () => ({ type: filters.type || null, startMs: filters.startMs, endMs: filters.endMs }),
    [filters.type, filters.startMs, filters.endMs],
  )
  const key = `${query.type ?? ''}|${query.startMs ?? ''}|${query.endMs ?? ''}|${reloadToken}`

  useEffect(() => {
    let ignore = false
    listStockMovementsPage(query)
      .then((page) => {
        if (!ignore) setList({ key, ...page, error: '' })
      })
      .catch((error) => {
        console.error(error)
        if (!ignore) setList({ ...EMPTY_LIST, key, error: getReportsErrorMessage(error, 'Não foi possível carregar os movimentos de stock.') })
      })
    // Limpeza: se os filtros mudarem antes da resposta, a resposta antiga é ignorada.
    return () => {
      ignore = true
    }
  }, [key, query])

  async function loadMore() {
    if (!list.hasMore || loadingMore) return
    setLoadingMore(true)
    setMoreError('')
    try {
      const page = await listStockMovementsPage({ ...query, cursor: list.cursor })
      setList((prev) => ({
        ...prev,
        items: [...prev.items, ...page.items.filter((item) => !prev.items.some((existing) => existing.id === item.id))],
        cursor: page.cursor,
        hasMore: page.hasMore,
      }))
    } catch (error) {
      console.error(error)
      setMoreError(getReportsErrorMessage(error, 'Não foi possível carregar mais movimentos.'))
    } finally {
      setLoadingMore(false)
    }
  }

  const reload = useCallback(() => setReloadToken((token) => token + 1), [])
  const loading = list.key !== key

  return {
    movements: loading ? [] : list.items,
    loading,
    error: loading ? '' : list.error,
    hasMore: list.hasMore,
    loadingMore,
    moreError,
    loadMore,
    reload,
  }
}
