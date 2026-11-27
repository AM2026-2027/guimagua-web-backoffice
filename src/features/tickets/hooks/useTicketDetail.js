import { useCallback, useEffect, useState } from 'react'
import {
  getTicketDetail,
  listTicketAppointmentsPage,
  updateTicketStatus as updateTicketStatusDocument,
} from '../../../services/ticketsService'
import { getTicketsErrorMessage } from '../utils/errors'

const EMPTY_DETAIL = { key: null, ticket: null, error: '' }

export function useTicketDetail(ticketId) {
  const [reloadToken, setReloadToken] = useState(0)
  const [detail, setDetail] = useState(EMPTY_DETAIL)
  const [actionError, setActionError] = useState('')
  const [appointmentsError, setAppointmentsError] = useState('')
  const [loadingMoreAppointments, setLoadingMoreAppointments] = useState(false)
  const key = `${ticketId ?? ''}:${reloadToken}`

  useEffect(() => {
    if (!ticketId) return undefined

    let ignore = false
    async function load() {
      try {
        const ticket = await getTicketDetail(ticketId)
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

  const reload = useCallback(() => {
    setActionError('')
    setAppointmentsError('')
    setReloadToken((token) => token + 1)
  }, [])

  async function loadMoreAppointments() {
    const ticket = detail.ticket
    if (!ticket?.pool_id || !ticket.appointmentsHasMore || loadingMoreAppointments) return false

    setLoadingMoreAppointments(true)
    setAppointmentsError('')
    try {
      const page = await listTicketAppointmentsPage(ticket.pool_id, ticket.appointmentsCursor)
      setDetail((previous) => ({
        ...previous,
        ticket: {
          ...previous.ticket,
          appointments: [...previous.ticket.appointments, ...page.items],
          appointmentsCursor: page.cursor,
          appointmentsHasMore: page.hasMore,
        },
      }))
      return true
    } catch (error) {
      console.error(error)
      setAppointmentsError(
        getTicketsErrorMessage(error, 'Não foi possível carregar mais intervenções.'),
      )
      return false
    } finally {
      setLoadingMoreAppointments(false)
    }
  }

  async function updateStatus(status, responseMessage = '') {
    setActionError('')
    try {
      const updated = await updateTicketStatusDocument(ticketId, status, responseMessage)
      if (!updated) throw new Error('Pedido não encontrado.')
      setDetail((previous) => ({
        ...previous,
        ticket: { ...previous.ticket, ...updated },
        error: '',
      }))
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
    appointmentsError,
    loadingMoreAppointments,
    loadMoreAppointments,
    updateStatus,
  }
}
