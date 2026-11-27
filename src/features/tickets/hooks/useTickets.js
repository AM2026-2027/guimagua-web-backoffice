import { useCallback, useEffect, useRef, useState } from 'react'
import {
  createTicket as createTicketDocument,
  getTicketById,
  getTicketQueueStats,
  listActiveClientsPage,
  listPoolsByClient,
  listRecentRespondedTickets,
  listTicketsPage,
} from '../../../services/ticketsService'
import { getTicketsErrorMessage } from '../utils/errors'
import { getSlaCutoffs } from '../utils/sla'

const EMPTY_LIST = { key: null, items: [], cursor: null, hasMore: false, error: '' }

function getOrStartRequest(requestRef, key, createRequest) {
  if (requestRef.current?.key === key) return requestRef.current.promise
  const promise = createRequest()
  requestRef.current = { key, promise }
  return promise
}

function replaceTicket(items, updated) {
  if (updated.status === 'responded') return items.filter((ticket) => ticket.id !== updated.id)
  const found = items.some((ticket) => ticket.id === updated.id)
  return found
    ? items.map((ticket) => (ticket.id === updated.id ? updated : ticket))
    : items
}

export function useTickets({ category, sla }) {
  const [reloadToken, setReloadToken] = useState(0)
  const [list, setList] = useState(EMPTY_LIST)
  const [stats, setStats] = useState(null)
  const [respondedTickets, setRespondedTickets] = useState([])
  const [summaryError, setSummaryError] = useState('')
  const [loadingMore, setLoadingMore] = useState(false)
  const [actionError, setActionError] = useState('')
  const [clientOptions, setClientOptions] = useState([])
  const [clientCursor, setClientCursor] = useState(null)
  const [clientsHasMore, setClientsHasMore] = useState(false)
  const [clientsLoading, setClientsLoading] = useState(false)
  const [poolOptions, setPoolOptions] = useState([])
  const [poolOptionsClientId, setPoolOptionsClientId] = useState(null)
  const [poolsLoading, setPoolsLoading] = useState(false)
  const poolsRequest = useRef(0)
  const firstPageRequest = useRef(null)
  const summaryRequest = useRef(null)

  const listKey = `${category}:${sla}:${reloadToken}`

  useEffect(() => {
    let ignore = false
    async function loadFirstPage() {
      try {
        // Partilha o pedido entre os ciclos setup/cleanup do StrictMode em desenvolvimento.
        const pageRequest = getOrStartRequest(firstPageRequest, listKey, () =>
          listTicketsPage({ category, sla, slaCutoffs: getSlaCutoffs() }),
        )
        const page = await pageRequest
        if (!ignore) setList({ key: listKey, ...page, error: '' })
      } catch (error) {
        console.error(error)
        if (!ignore) {
          setList({
            ...EMPTY_LIST,
            key: listKey,
            error: getTicketsErrorMessage(error, 'Não foi possível carregar a fila de pedidos.'),
          })
        }
      }
    }

    loadFirstPage()
    return () => {
      ignore = true
    }
  }, [category, sla, listKey])

  useEffect(() => {
    let ignore = false
    async function loadSummary() {
      try {
        const request = getOrStartRequest(summaryRequest, reloadToken, () =>
          Promise.all([
            getTicketQueueStats(getSlaCutoffs()),
            listRecentRespondedTickets(),
          ]),
        )
        const [nextStats, recentResponses] = await request
        if (!ignore) {
          setStats(nextStats)
          setRespondedTickets(recentResponses)
          setSummaryError('')
        }
      } catch (error) {
        console.error(error)
        if (!ignore) {
          setStats(null)
          setRespondedTickets([])
          setSummaryError(getTicketsErrorMessage(error, 'Não foi possível calcular os indicadores da fila.'))
        }
      }
    }

    loadSummary()
    return () => {
      ignore = true
    }
  }, [reloadToken])

  const reload = useCallback(() => setReloadToken((token) => token + 1), [])

  async function loadMore() {
    if (!list.hasMore || loadingMore || list.key !== listKey) return
    setLoadingMore(true)
    setActionError('')
    try {
      const page = await listTicketsPage({
        category,
        sla,
        cursor: list.cursor,
        slaCutoffs: getSlaCutoffs(),
      })
      setList((previous) =>
        previous.key !== listKey
          ? previous
          : {
              ...previous,
              items: [
                ...previous.items,
                ...page.items.filter((item) => !previous.items.some((old) => old.id === item.id)),
              ],
              cursor: page.cursor,
              hasMore: page.hasMore,
            },
      )
    } catch (error) {
      console.error(error)
      setActionError(getTicketsErrorMessage(error, 'Não foi possível carregar mais pedidos.'))
    } finally {
      setLoadingMore(false)
    }
  }

  async function findTicketById(ticketId) {
    setActionError('')
    const normalizedId = ticketId.trim()
    if (!normalizedId || normalizedId.includes('/')) return null
    try {
      return await getTicketById(normalizedId)
    } catch (error) {
      console.error(error)
      setActionError(getTicketsErrorMessage(error, 'Não foi possível pesquisar o pedido.'))
      return undefined
    }
  }

  async function createTicket(payload) {
    setActionError('')
    try {
      await createTicketDocument(payload)
      reload()
      return true
    } catch (error) {
      console.error(error)
      setActionError(getTicketsErrorMessage(error, 'Não foi possível criar o pedido manual.'))
      return false
    }
  }

  function applyTicketUpdate(updated) {
    setList((previous) => ({ ...previous, items: replaceTicket(previous.items, updated) }))
  }

  async function loadClientsFirstPage() {
    setClientsLoading(true)
    setActionError('')
    try {
      const page = await listActiveClientsPage()
      setClientOptions(page.items)
      setClientCursor(page.cursor)
      setClientsHasMore(page.hasMore)
    } catch (error) {
      console.error(error)
      setActionError(getTicketsErrorMessage(error, 'Não foi possível carregar os clientes.'))
    } finally {
      setClientsLoading(false)
    }
  }

  async function loadMoreClients() {
    if (!clientsHasMore || clientsLoading) return
    setClientsLoading(true)
    setActionError('')
    try {
      const page = await listActiveClientsPage(clientCursor)
      setClientOptions((previous) => [
        ...previous,
        ...page.items.filter((item) => !previous.some((old) => old.id === item.id)),
      ])
      setClientCursor(page.cursor)
      setClientsHasMore(page.hasMore)
    } catch (error) {
      console.error(error)
      setActionError(getTicketsErrorMessage(error, 'Não foi possível carregar mais clientes.'))
    } finally {
      setClientsLoading(false)
    }
  }

  async function loadPoolsForClient(clientId) {
    const requestId = poolsRequest.current + 1
    poolsRequest.current = requestId
    setPoolOptionsClientId(clientId)
    setPoolOptions([])
    if (!clientId) return

    setPoolsLoading(true)
    setActionError('')
    try {
      const pools = await listPoolsByClient(clientId)
      if (poolsRequest.current === requestId) setPoolOptions(pools)
    } catch (error) {
      console.error(error)
      if (poolsRequest.current === requestId) {
        setActionError(getTicketsErrorMessage(error, 'Não foi possível carregar as piscinas do cliente.'))
      }
    } finally {
      if (poolsRequest.current === requestId) setPoolsLoading(false)
    }
  }

  const loading = list.key !== listKey

  return {
    tickets: loading ? [] : list.items,
    cursor: list.cursor,
    hasMore: list.hasMore,
    loading,
    loadingMore,
    error: loading ? '' : list.error,
    loadMore,
    reload,
    stats,
    respondedTickets,
    summaryError,
    actionError,
    clearActionError: () => setActionError(''),
    findTicketById,
    createTicket,
    applyTicketUpdate,
    clientOptions,
    clientsHasMore,
    clientsLoading,
    loadClientsFirstPage,
    loadMoreClients,
    poolOptions,
    poolOptionsClientId,
    poolsLoading,
    loadPoolsForClient,
  }
}
