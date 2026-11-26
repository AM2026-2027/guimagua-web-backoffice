import { useState } from 'react'
import ErrorAlert from '../../../shared/components/ErrorAlert'
import FormField from '../../../shared/components/FormField'
import LoadingSpinner from '../../../shared/components/LoadingSpinner'
import StatusBadge from '../../../shared/components/StatusBadge'
import { CARD_CLASS, INPUT_CLASS, PRIMARY_BUTTON, SECONDARY_BUTTON } from '../../../shared/components/uiClasses'
import { formatTicketDateTime, ticketCategoryLabel, ticketPriorityLabel, ticketStatusLabel } from '../utils/labels'
import {
  formatTicketAge,
  getSlaStatus,
  slaLabel,
  SLA_TOTAL_HOURS,
} from '../utils/sla'

export default function TicketDetailPanel({ detail, onRetry, onUpdateStatus }) {
  const [responseMessage, setResponseMessage] = useState('')
  const [formError, setFormError] = useState('')
  const [operationError, setOperationError] = useState('')
  const [saving, setSaving] = useState(false)
  const ticket = detail.ticket

  function dismissError() {
    detail.clearActionError()
    setFormError('')
    setOperationError('')
  }

  async function handleTriage() {
    setSaving(true)
    setOperationError('')
    try {
      await onUpdateStatus('in_analysis')
    } catch (error) {
      console.error(error)
      setOperationError('Não foi possível iniciar a triagem.')
    } finally {
      setSaving(false)
    }
  }

  async function handleRespond(event) {
    event.preventDefault()
    if (!responseMessage.trim()) {
      setFormError('Escreva a resposta antes de marcar o pedido como respondido.')
      return
    }

    setSaving(true)
    setFormError('')
    setOperationError('')
    try {
      const saved = await onUpdateStatus('responded', responseMessage)
      if (saved) setResponseMessage('')
    } catch (error) {
      console.error(error)
      setOperationError('Não foi possível registar a resposta.')
    } finally {
      setSaving(false)
    }
  }

  if (detail.loading) {
    return (
      <aside className={`${CARD_CLASS} p-6`} aria-label="Detalhe do pedido">
        <LoadingSpinner label="A carregar pedido..." />
      </aside>
    )
  }

  if (detail.error || !ticket) {
    return (
      <aside className={`${CARD_CLASS} space-y-3 p-5`} aria-label="Detalhe do pedido">
        <h2 className="text-lg font-semibold text-slate-800">Detalhe do pedido</h2>
        <ErrorAlert message={detail.error || 'Selecione um pedido da fila.'} />
        {detail.error && (
          <button type="button" onClick={onRetry} className={SECONDARY_BUTTON}>
            Tentar novamente
          </button>
        )}
      </aside>
    )
  }

  const sla = getSlaStatus(ticket.created_at)
  const statusLabel = ticketStatusLabel(ticket.status)
  const equipment = Array.isArray(ticket.pool?.equipment) ? ticket.pool.equipment : []

  return (
    <aside className={`${CARD_CLASS} h-fit space-y-5 p-5`} aria-label={`Detalhe do pedido ${ticket.id}`}>
      <header className="space-y-3 border-b border-slate-200 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-red-700">
            {sla === 'critical'
              ? `Prioridade máxima — SLA ${SLA_TOTAL_HOURS} h crítico`
              : `SLA ${SLA_TOTAL_HOURS} h ${slaLabel(sla)}`}
          </span>
          <span className="font-mono text-xs text-slate-500">{ticket.id}</span>
        </div>
        <h2 className="text-xl font-bold text-slate-800">{ticket.client?.name ?? 'Cliente não encontrado'}</h2>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge active={ticket.status !== 'pending'} activeLabel={statusLabel} inactiveLabel={statusLabel} />
          <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-primary">
            {ticketCategoryLabel(ticket.category)}
          </span>
          <span className="text-xs text-slate-500">Prioridade {ticketPriorityLabel(ticket.priority)}</span>
        </div>
      </header>

      <section aria-labelledby="ticket-history-title">
        <h3 id="ticket-history-title" className="font-semibold text-slate-800">
          Histórico do pedido
        </h3>
        <ol className="mt-3 space-y-3 border-l-2 border-slate-200 pl-4 text-sm">
          <li>
            <p className="font-medium text-slate-700">Pedido submetido</p>
            <time className="text-xs text-slate-500">{formatTicketDateTime(ticket.created_at)}</time>
            <p className="text-xs text-slate-500">{formatTicketAge(ticket.created_at)}</p>
          </li>
          {ticket.responded_at && (
            <li>
              <p className="font-medium text-slate-700">Resposta enviada</p>
              <time className="text-xs text-slate-500">{formatTicketDateTime(ticket.responded_at)}</time>
            </li>
          )}
        </ol>
      </section>

      <section aria-labelledby="ticket-description-title">
        <h3 id="ticket-description-title" className="font-semibold text-slate-800">
          Descrição
        </h3>
        <p className="mt-2 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
          {ticket.description}
        </p>
      </section>

      <section aria-labelledby="ticket-pool-title">
        <h3 id="ticket-pool-title" className="font-semibold text-slate-800">
          Piscina e localização
        </h3>
        <dl className="mt-2 grid grid-cols-2 gap-3 text-sm">
          <div className="col-span-2">
            <dt className="text-xs text-slate-500">Morada</dt>
            <dd className="text-slate-700">{ticket.pool?.local_address ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Dimensões</dt>
            <dd className="text-slate-700">{ticket.pool?.dimensions ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Tratamento</dt>
            <dd className="text-slate-700">{ticket.pool?.treatment_type ?? '—'}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-xs text-slate-500">Equipamento registado</dt>
            <dd className="text-slate-700">{equipment.length > 0 ? equipment.join(', ') : '—'}</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="ticket-client-title" className="rounded-lg border border-slate-200 p-3">
        <h3 id="ticket-client-title" className="font-semibold text-slate-800">
          Contacto do cliente
        </h3>
        <p className="mt-1 text-sm text-slate-700">{ticket.client?.name ?? '—'}</p>
        {ticket.client?.phone && (
          <a href={`tel:${ticket.client.phone.replace(/[^\d+]/g, '')}`} className="mt-1 inline-block text-sm text-primary hover:underline">
            {ticket.client.phone}
          </a>
        )}
        {ticket.client?.email && <p className="text-sm text-slate-600">{ticket.client.email}</p>}
      </section>

      {ticket.response_message && (
        <section>
          <h3 className="font-semibold text-slate-800">Resposta registada</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{ticket.response_message}</p>
        </section>
      )}

      <ErrorAlert message={detail.actionError || formError || operationError} onClose={dismissError} />

      {ticket.status === 'pending' && (
        <button
          type="button"
          onClick={handleTriage}
          disabled={saving}
          className={`${PRIMARY_BUTTON} w-full`}
        >
          {saving ? 'A guardar...' : 'Iniciar triagem'}
        </button>
      )}

      {ticket.status === 'in_analysis' && (
        <form onSubmit={handleRespond} noValidate className="space-y-3">
          <FormField id="ticket-response" label="Resposta ao cliente" required>
            {(fieldProps) => (
              <textarea
                {...fieldProps}
                value={responseMessage}
                onChange={(event) => setResponseMessage(event.target.value)}
                rows={4}
                className={INPUT_CLASS}
              />
            )}
          </FormField>
          <button type="submit" disabled={saving} className={`${PRIMARY_BUTTON} w-full`}>
            {saving ? 'A guardar...' : 'Registar resposta e concluir'}
          </button>
        </form>
      )}
    </aside>
  )
}
