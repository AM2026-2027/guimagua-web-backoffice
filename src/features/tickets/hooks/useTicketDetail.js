import { useCallback, useEffect, useRef, useState } from 'react'
import {
  getTicketById,
  updateTicketStatus as updateTicketStatusDocument,
} from '../../../services/ticketsService'
import { getTicketsErrorMessage } from '../utils/errors'

const EMPTY_DETAIL = { key: null, ticket: null, error: '' }

export function useTicketDetail(ticketId, initialTicket, onTicketUpdated) {
  const [reloadToken, setReloadToken] = useState(0)
  const [detail, setDetail] = useState(EMPTY_DETAIL)
  const [actionError, setActionError] = useState('')
  const key = `${ticketId ?? ''}:${reloadToken}`
  const initialTicketRef = useRef(initialTicket)

  useEffect(() => {
    initialTicketRef.current = initialTicket
  }, [initialTicket])

  useEffect(() => {
    if (!ticketId) return undefined

    let ignore = false
    async function load() {
      const cachedTicket = initialTicketRef.current
      if (cachedTicket?.id === ticketId) {
        setDetail({ key, ticket: cachedTicket, error: '' })
        return
      }

      try {
        const ticket = await getTicketById(ticketId)
        if (!ignore) {
          setDetail({
            key,
            ticket,
            error: ticket ? '' : 'Pedido não encontrado.',
          })
        }
      } catch (error) {
        console.error(error)
        if (!ignore) {
          setDetail({
            ...EMPTY_DETAIL,
            key,
            error: getTicketsErrorMessage(error, 'Não foi possível carregar o pedido.'),
          })
        }
      }
    }

    load()
    return () => {
      ignore = true
    }
  }, [ticketId, key])

  const reload = useCallback(() => setReloadToken((token) => token + 1), [])

  async function updateStatus(status, responseMessage = '') {
    setActionError('')
    try {
      const updated = await updateTicketStatusDocument(ticketId, status, responseMessage)
      if (!updated) throw new Error('Pedido não encontrado.')
      setDetail({ key, ticket: updated, error: '' })
      onTicketUpdated?.(updated)
      return true
    } catch (error) {
      console.error(error)
      setActionError(getTicketsErrorMessage(error, 'Não foi possível atualizar o pedido.'))
      return false
    }
  }

  const loading = Boolean(ticketId) && detail.key !== key

  return {
    ticket: !ticketId || loading ? null : detail.ticket,
    loading,
    error: !ticketId || loading ? '' : detail.error,
    reload,
    actionError,
    clearActionError: () => setActionError(''),
    updateStatus,
  }
}
