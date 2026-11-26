import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import ErrorAlert from '../../../shared/components/ErrorAlert'
import LoadingSpinner from '../../../shared/components/LoadingSpinner'
import Notice from '../../../shared/components/Notice'
import { PRIMARY_BUTTON, SECONDARY_BUTTON } from '../../../shared/components/uiClasses'
import TicketCard from '../components/TicketCard'
import TicketDetailPanel from '../components/TicketDetailPanel'
import TicketFormModal from '../components/TicketFormModal'
import TicketsStats from '../components/TicketsStats'
import TicketsToolbar from '../components/TicketsToolbar'
import { useTicketDetail } from '../hooks/useTicketDetail'
import { useTickets } from '../hooks/useTickets'
import { downloadTicketsCsv } from '../utils/csv'
import { averageResponseMinutes, formatDurationMinutes } from '../utils/sla'
import { filterTicketsBySearch, sortTicketsFIFO } from '../utils/sort'

export default function TicketsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const ticketId = searchParams.get('ticket')
  const autoSelectionHandled = useRef(Boolean(ticketId))
  const [category, setCategory] = useState('all')
  const [sla, setSla] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [notice, setNotice] = useState('')
  const [manualFormOpen, setManualFormOpen] = useState(false)
  const list = useTickets({ category, sla })

  const orderedTickets = useMemo(() => sortTicketsFIFO(list.tickets), [list.tickets])
  const visibleTickets = useMemo(
    () => filterTicketsBySearch(orderedTickets, searchTerm),
    [orderedTickets, searchTerm],
  )
  const selectedTicket = list.tickets.find((ticket) => ticket.id === ticketId) ?? null
  const detail = useTicketDetail(ticketId, selectedTicket, list.applyTicketUpdate)

  const selectTicket = useCallback(
    (id) => setSearchParams({ ticket: id }),
    [setSearchParams],
  )

  useEffect(() => {
    if (autoSelectionHandled.current || ticketId || list.loading || orderedTickets.length === 0) return
    autoSelectionHandled.current = true
    selectTicket(orderedTickets[0].id)
  }, [ticketId, list.loading, orderedTickets, selectTicket])

  async function handleSearchById() {
    const queryText = searchTerm.trim()
    if (!queryText) return
    if (visibleTickets.length > 0) {
      setNotice('')
      return
    }

    const ticket = await list.findTicketById(queryText)
    if (ticket) {
      selectTicket(ticket.id)
      setNotice('')
    } else if (ticket === null) {
      setNotice('Não foi encontrado um pedido com essa referência.')
    }
  }

  async function openManualForm() {
    list.clearActionError()
    setManualFormOpen(true)
    await list.loadClientsFirstPage()
  }

  async function handleCreateTicket(payload) {
    const created = await list.createTicket(payload)
    if (created) setNotice('Pedido manual criado com sucesso.')
    return created
  }

  async function handleStatusUpdate(status, responseMessage) {
    const updated = await detail.updateStatus(status, responseMessage)
    if (updated) {
      setNotice(status === 'responded' ? 'Resposta registada e pedido concluído.' : 'Pedido colocado em triagem.')
      if (status === 'responded') list.reload()
    }
    return updated
  }

  const categoryCounts = list.stats
    ? { total: list.stats.open, ...list.stats.categories }
    : null
  const slaCounts = list.stats ? { total: list.stats.open, ...list.stats.sla } : null
  const responseAverage = averageResponseMinutes(list.respondedTickets)

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Gestão de pedidos</p>
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
              Fila FIFO ativa
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-slate-800">Receção de Pedidos &amp; Orçamentos</h1>
          <p className="mt-2 text-sm text-slate-600" aria-live="polite">
            {list.stats
              ? `${list.stats.open} pedidos pendentes · ${list.stats.sla.critical} pedidos críticos · Tempo médio até resposta (últimos pedidos carregados): ${formatDurationMinutes(responseAverage)}`
              : 'A carregar os indicadores da fila...'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => downloadTicketsCsv(visibleTickets)}
            disabled={visibleTickets.length === 0}
            className={SECONDARY_BUTTON}
          >
            Exportar pedidos carregados (CSV)
          </button>
          <button type="button" onClick={openManualForm} className={PRIMARY_BUTTON}>
            + Novo pedido manual
          </button>
        </div>
      </header>

      <Notice message={notice} onClose={() => setNotice('')} />
      {list.summaryError && <ErrorAlert message={list.summaryError} />}
      {!manualFormOpen && <ErrorAlert message={list.actionError} onClose={list.clearActionError} />}

      <TicketsStats stats={list.stats} oldest={orderedTickets[0] ?? null} />

      <TicketsToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchById={handleSearchById}
        category={category}
        onCategoryChange={setCategory}
        sla={sla}
        onSlaChange={setSla}
        categoryCounts={categoryCounts}
        slaCounts={slaCounts}
      />

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(20rem,0.9fr)]">
        <section aria-labelledby="ticket-queue-title" className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 id="ticket-queue-title" className="text-lg font-semibold text-slate-800">
                Fila de entrada organizada por antiguidade
              </h2>
              <p className="text-xs text-slate-500">
                {searchTerm.trim()
                  ? `${visibleTickets.length} resultado(s) entre os pedidos carregados`
                  : `${list.tickets.length} pedidos carregados`}
              </p>
            </div>
            <button type="button" onClick={list.reload} disabled={list.loading} className={SECONDARY_BUTTON}>
              Atualizar fila
            </button>
          </div>

          {list.loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8">
              <LoadingSpinner label="A carregar a fila de pedidos..." />
            </div>
          ) : list.error ? (
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
              <ErrorAlert message={list.error} />
              <button type="button" onClick={list.reload} className={SECONDARY_BUTTON}>
                Tentar novamente
              </button>
            </div>
          ) : visibleTickets.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <p className="text-sm text-slate-600">
                {searchTerm.trim() ? 'Não há pedidos carregados que correspondam à pesquisa.' : 'Não há pedidos nesta fila com os filtros selecionados.'}
              </p>
              {searchTerm.trim() && (
                <p className="mt-1 text-xs text-slate-500">
                  A pesquisa por cliente e concelho abrange apenas os pedidos carregados. Use “Procurar referência exata” para procurar um ID.
                </p>
              )}
            </div>
          ) : (
            <>
              {visibleTickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  selected={ticket.id === ticketId}
                  onSelect={() => selectTicket(ticket.id)}
                />
              ))}
              {list.hasMore && !searchTerm.trim() && (
                <button type="button" onClick={list.loadMore} disabled={list.loadingMore} className={`${SECONDARY_BUTTON} w-full`}>
                  {list.loadingMore ? 'A carregar...' : 'Carregar mais pedidos'}
                </button>
              )}
              {list.actionError && <ErrorAlert message={list.actionError} onClose={list.clearActionError} />}
            </>
          )}
        </section>

        <TicketDetailPanel
          detail={detail}
          onRetry={detail.reload}
          onUpdateStatus={handleStatusUpdate}
        />
      </div>

      {manualFormOpen && (
        <TicketFormModal
          clients={list.clientOptions}
          clientsHasMore={list.clientsHasMore}
          clientsLoading={list.clientsLoading}
          pools={list.poolOptions}
          poolsLoading={list.poolsLoading}
          poolsClientId={list.poolOptionsClientId}
          error={list.actionError}
          onDismissError={list.clearActionError}
          onLoadMoreClients={list.loadMoreClients}
          onClientChange={list.loadPoolsForClient}
          onSubmit={handleCreateTicket}
          onClose={() => setManualFormOpen(false)}
        />
      )}
    </div>
  )
}
