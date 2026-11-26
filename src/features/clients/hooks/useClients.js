import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  countActiveClientsAndPools,
  listClientsPage,
  listPoolsByClientIds,
  searchClients,
} from '../../../services/clientsService'
import { persistClientActive, persistClientUpdate, persistNewClient } from './clientActions'
import { getClientsErrorMessage } from '../utils/errors'
import { clientMatches, parseSearchTerm } from '../utils/text'

const SEARCH_DEBOUNCE_MS = 350

const EMPTY_LIST = { key: null, items: [], pools: [], cursor: null, hasMore: false, error: '' }
const EMPTY_SEARCH = { term: null, items: [], pools: [], error: '' }

function replaceById(items, updated) {
  return items.map((item) => (item.id === updated.id ? updated : item))
}

function matchesStatus(client, status) {
  if (status === 'active') return client.is_active !== false
  if (status === 'inactive') return client.is_active === false
  return true
}

/**
 * Lista de clientes com paginação por cursor, pesquisa e filtro por estado.
 * `onClientCreated(client)` é chamado depois de criar um cliente (a página abre a ficha, US01).
 */
export function useClients({ onClientCreated } = {}) {
  const [status, setStatus] = useState('all')
  const [reloadToken, setReloadToken] = useState(0)
  const [list, setList] = useState(EMPTY_LIST)
  const [loadingMore, setLoadingMore] = useState(false)
  const [counts, setCounts] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedTerm, setDebouncedTerm] = useState('')
  const [search, setSearch] = useState(EMPTY_SEARCH)
  const [actionError, setActionError] = useState('')

  const listKey = `${status}:${reloadToken}`

  // Primeira página: volta a ler quando muda o filtro de estado ou quando se pede "Tentar novamente".
  useEffect(() => {
    let ignore = false
    async function loadFirstPage() {
      try {
        const page = await listClientsPage({ status })
        const pools = await listPoolsByClientIds(page.items.map((client) => client.id))
        if (!ignore) setList({ key: listKey, ...page, pools, error: '' })
      } catch (error) {
        console.error(error)
        if (!ignore) {
          setList({ ...EMPTY_LIST, key: listKey, error: getClientsErrorMessage(error, 'Não foi possível carregar os clientes.') })
        }
      }
    }
    loadFirstPage()
    // Limpeza: ignora a resposta se o filtro mudar antes de ela chegar.
    return () => {
      ignore = true
    }
  }, [status, listKey])

  // Totais dos cartões: uma vez por abertura do ecrã; depois são ajustados localmente.
  useEffect(() => {
    let ignore = false
    countActiveClientsAndPools()
      .then((result) => {
        if (!ignore) setCounts(result)
      })
      .catch((error) => console.error(error))
    return () => {
      ignore = true
    }
  }, [])

  // Espera que o utilizador pare de escrever antes de pesquisar no servidor (poupa leituras).
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(searchTerm.trim()), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    const parsed = parseSearchTerm(debouncedTerm)
    if (!parsed) return undefined
    let ignore = false
    async function runSearch() {
      try {
        const items = await searchClients(parsed)
        const pools = await listPoolsByClientIds(items.map((client) => client.id))
        if (!ignore) setSearch({ term: debouncedTerm, items, pools, error: '' })
      } catch (error) {
        console.error(error)
        if (!ignore) {
          setSearch({ ...EMPTY_SEARCH, term: debouncedTerm, error: getClientsErrorMessage(error, 'A pesquisa no servidor falhou.') })
        }
      }
    }
    runSearch()
    return () => {
      ignore = true
    }
  }, [debouncedTerm])

  const loading = list.key !== listKey
  const trimmedTerm = searchTerm.trim()
  const serverSearchActive = Boolean(parseSearchTerm(trimmedTerm))
  const searchReady = search.term === debouncedTerm && debouncedTerm === trimmedTerm
  const searching = serverSearchActive && !searchReady

  // Resultado visível: páginas carregadas filtradas localmente + resultados do servidor (sem repetidos).
  const clients = useMemo(() => {
    const base = trimmedTerm ? list.items.filter((client) => clientMatches(client, trimmedTerm)) : list.items
    const extra = trimmedTerm && searchReady ? search.items : []
    const seen = new Set(base.map((client) => client.id))
    const merged = [...base, ...extra.filter((client) => !seen.has(client.id))]
    return merged.filter((client) => matchesStatus(client, status))
  }, [list.items, search.items, searchReady, trimmedTerm, status])

  const poolsByClient = useMemo(() => {
    const map = new Map()
    for (const pool of [...list.pools, ...search.pools]) {
      const current = map.get(pool.client_id) ?? new Map()
      current.set(pool.id, pool)
      map.set(pool.client_id, current)
    }
    return new Map([...map].map(([clientId, pools]) => [clientId, [...pools.values()]]))
  }, [list.pools, search.pools])

  const changeStatus = useCallback((nextStatus) => setStatus(nextStatus), [])
  const reload = useCallback(() => setReloadToken((token) => token + 1), [])

  async function loadMore() {
    if (!list.hasMore || loadingMore) return
    setLoadingMore(true)
    try {
      const page = await listClientsPage({ status, cursor: list.cursor })
      const pools = await listPoolsByClientIds(page.items.map((client) => client.id))
      setList((prev) => ({
        ...prev,
        items: [...prev.items, ...page.items.filter((item) => !prev.items.some((c) => c.id === item.id))],
        pools: [...prev.pools, ...pools],
        cursor: page.cursor,
        hasMore: page.hasMore,
      }))
    } catch (error) {
      console.error(error)
      setActionError(getClientsErrorMessage(error, 'Não foi possível carregar mais clientes.'))
    } finally {
      setLoadingMore(false)
    }
  }

  /** Aplica localmente um cliente alterado noutro ecrã (ex.: na ficha), sem nova leitura. */
  const upsertClient = useCallback((client) => {
    setList((prev) => ({ ...prev, items: replaceById(prev.items, client) }))
    setSearch((prev) => ({ ...prev, items: replaceById(prev.items, client) }))
  }, [])

  /** Aplica localmente uma piscina criada ou alterada na ficha. */
  const upsertPool = useCallback((pool) => {
    const apply = (prev) => {
      const exists = prev.pools.some((item) => item.id === pool.id)
      const clientLoaded = prev.items.some((client) => client.id === pool.client_id)
      if (!exists && !clientLoaded) return prev
      return { ...prev, pools: exists ? replaceById(prev.pools, pool) : [...prev.pools, pool] }
    }
    setList(apply)
    setSearch(apply)
  }, [])

  /** Ajusta os totais dos cartões depois de criar, desativar ou reativar ({ clients, inactiveClients, pools }). */
  const adjustCounts = useCallback((delta) => {
    setCounts((prev) =>
      prev
        ? {
            clients: prev.clients + (delta.clients ?? 0),
            inactiveClients: prev.inactiveClients + (delta.inactiveClients ?? 0),
            pools: prev.pools + (delta.pools ?? 0),
          }
        : prev,
    )
  }, [])

  async function createClient(payload) {
    setActionError('')
    try {
      const created = await persistNewClient(payload)
      setList((prev) => ({ ...prev, items: [created, ...prev.items] }))
      adjustCounts({ clients: 1 })
      onClientCreated?.(created)
      return true
    } catch (error) {
      console.error(error)
      setActionError(getClientsErrorMessage(error, 'Não foi possível criar o cliente.'))
      return false
    }
  }

  async function updateClient(client, payload) {
    setActionError('')
    try {
      upsertClient(await persistClientUpdate(client, payload))
      return true
    } catch (error) {
      console.error(error)
      setActionError(getClientsErrorMessage(error, 'Não foi possível guardar as alterações.'))
      return false
    }
  }

  async function setClientActive(client, isActive) {
    setActionError('')
    try {
      upsertClient(await persistClientActive(client, isActive))
      adjustCounts({ clients: isActive ? 1 : -1, inactiveClients: isActive ? -1 : 1 })
      return true
    } catch (error) {
      console.error(error)
      setActionError(getClientsErrorMessage(error, 'Não foi possível alterar o estado do cliente.'))
      return false
    }
  }

  return {
    clients,
    poolsByClient,
    counts,
    status,
    changeStatus,
    searchTerm,
    setSearchTerm,
    searching,
    searchError: searchReady ? search.error : '',
    loading,
    loadingMore,
    hasMore: list.hasMore && !trimmedTerm,
    error: loading ? '' : list.error,
    reload,
    loadMore,
    actionError,
    clearActionError: () => setActionError(''),
    createClient,
    updateClient,
    setClientActive,
    upsertClient,
    upsertPool,
    adjustCounts,
  }
}
