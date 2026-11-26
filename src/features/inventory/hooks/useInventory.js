import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  adjustConsumableStock,
  countActiveConsumables,
  createConsumable,
  findConsumablesBySku,
  listConsumablesPage,
  setConsumableActive,
  updateConsumable,
} from '../../../services/inventoryService'
import { getInventoryErrorMessage } from '../utils/errors'
import { skuPrefixFor } from '../utils/labels'

const SEARCH_DEBOUNCE_MS = 350
const SKU_SEARCH_REGEX = /^[A-Z0-9-]{3,}$/

const EMPTY_LIST = { key: null, items: [], cursor: null, hasMore: false, error: '' }
const EMPTY_SKU = { term: null, items: [] }

function upsertById(items, updated) {
  return items.some((item) => item.id === updated.id)
    ? items.map((item) => (item.id === updated.id ? updated : item))
    : items
}

/**
 * Consumíveis com paginação por cursor (RNF-WEB02) e operações (devolvem true/false).
 * A pesquisa por texto é feita na página sobre os artigos carregados; um texto com formato de SKU
 * faz também uma procura exata no servidor. `onCreated(consumable)` recebe o artigo criado (com o SKU).
 */
export function useInventory({ onCreated } = {}) {
  const [reloadToken, setReloadToken] = useState(0)
  const [list, setList] = useState(EMPTY_LIST)
  const [loadingMore, setLoadingMore] = useState(false)
  const [activeCount, setActiveCount] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedTerm, setDebouncedTerm] = useState('')
  const [skuSearch, setSkuSearch] = useState(EMPTY_SKU)
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        const page = await listConsumablesPage()
        if (!ignore) setList({ key: reloadToken, ...page, error: '' })
      } catch (error) {
        console.error(error)
        if (!ignore) setList({ ...EMPTY_LIST, key: reloadToken, error: getInventoryErrorMessage(error, 'Não foi possível carregar o inventário.') })
      }
    }
    load()
    // Limpeza: ignora a resposta se o pedido for repetido antes de chegar.
    return () => {
      ignore = true
    }
  }, [reloadToken])

  useEffect(() => {
    let ignore = false
    countActiveConsumables()
      .then((count) => {
        if (!ignore) setActiveCount(count)
      })
      .catch((error) => console.error(error))
    return () => {
      ignore = true
    }
  }, [])

  // Espera que o utilizador pare de escrever antes de procurar o SKU no servidor (poupa leituras).
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(searchTerm.trim().toUpperCase()), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    if (!SKU_SEARCH_REGEX.test(debouncedTerm)) return undefined
    let ignore = false
    findConsumablesBySku(debouncedTerm)
      .then((items) => {
        if (!ignore) setSkuSearch({ term: debouncedTerm, items })
      })
      .catch((error) => console.error(error))
    return () => {
      ignore = true
    }
  }, [debouncedTerm])

  const loading = list.key !== reloadToken

  // Artigos carregados + resultados da procura por SKU que ainda não estejam na lista.
  const items = useMemo(() => {
    const extra = skuSearch.term && skuSearch.term === debouncedTerm ? skuSearch.items : []
    const ids = new Set(list.items.map((item) => item.id))
    return [...list.items, ...extra.filter((item) => !ids.has(item.id))]
  }, [list.items, skuSearch, debouncedTerm])

  const reload = useCallback(() => setReloadToken((token) => token + 1), [])
  const clearActionError = useCallback(() => setActionError(''), [])

  function applyChange(updated) {
    setList((prev) => ({ ...prev, items: upsertById(prev.items, updated) }))
    setSkuSearch((prev) => ({ ...prev, items: upsertById(prev.items, updated) }))
  }

  async function run(action, fallback) {
    setActionError('')
    try {
      await action()
      return true
    } catch (error) {
      console.error(error)
      setActionError(getInventoryErrorMessage(error, fallback))
      return false
    }
  }

  async function loadMore() {
    if (!list.hasMore || loadingMore) return
    setLoadingMore(true)
    try {
      const page = await listConsumablesPage({ cursor: list.cursor })
      setList((prev) => ({
        ...prev,
        items: [...prev.items, ...page.items.filter((item) => !prev.items.some((existing) => existing.id === item.id))],
        cursor: page.cursor,
        hasMore: page.hasMore,
      }))
    } catch (error) {
      console.error(error)
      setActionError(getInventoryErrorMessage(error, 'Não foi possível carregar mais artigos.'))
    } finally {
      setLoadingMore(false)
    }
  }

  function create(payload) {
    return run(async () => {
      const created = await createConsumable(payload, skuPrefixFor(payload.category))
      setList((prev) => ({ ...prev, items: [created, ...prev.items] }))
      setActiveCount((prev) => (prev === null ? prev : prev + 1))
      onCreated?.(created)
    }, 'Não foi possível criar o artigo.')
  }

  function update(consumable, payload) {
    return run(async () => {
      await updateConsumable(consumable.id, payload)
      applyChange({ ...consumable, ...payload })
    }, 'Não foi possível guardar o artigo.')
  }

  /** Ajuste de stock com registo do movimento (entrada/saída) para o histórico. */
  function adjustStock(consumable, delta, reason) {
    return run(async () => {
      const result = await adjustConsumableStock(consumable.id, delta, reason)
      applyChange({ ...consumable, ...result })
    }, 'Não foi possível ajustar o stock.')
  }

  function setActive(consumable, isActive) {
    return run(async () => {
      await setConsumableActive(consumable.id, isActive)
      applyChange({ ...consumable, is_active: isActive })
      setActiveCount((prev) => (prev === null ? prev : prev + (isActive ? 1 : -1)))
    }, 'Não foi possível alterar o estado do artigo.')
  }

  return {
    items: loading ? [] : items,
    loading,
    error: loading ? '' : list.error,
    reload,
    hasMore: list.hasMore,
    loadingMore,
    loadMore,
    activeCount,
    searchTerm,
    setSearchTerm,
    actionError,
    clearActionError,
    create,
    update,
    adjustStock,
    setActive,
  }
}
