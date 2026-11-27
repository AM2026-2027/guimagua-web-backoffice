import { useCallback } from 'react'
import { useSearchParams } from 'react-router'
import TicketDetailView from './TicketDetailView'
import TicketsQueueView from './TicketsQueueView'

export default function TicketsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const ticketId = searchParams.get('ticket')

  const returnToQueue = useCallback(() => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('ticket')
    setSearchParams(nextParams)
  }, [searchParams, setSearchParams])

  return ticketId ? (
    <TicketDetailView key={ticketId} ticketId={ticketId} onBack={returnToQueue} />
  ) : (
    <TicketsQueueView />
  )
}
