import StatusBadge from '../../../shared/components/StatusBadge'
import { CARD_CLASS } from '../../../shared/components/uiClasses'
import { ticketCategoryLabel, ticketPriorityLabel, ticketStatusLabel } from '../utils/labels'
import { formatTicketAge, getSlaStatus, slaLabel } from '../utils/sla'

const SLA_CLASSES = {
  critical: 'bg-red-100 text-red-700',
  attention: 'bg-amber-100 text-amber-800',
  regular: 'bg-emerald-100 text-emerald-800',
  unknown: 'bg-slate-100 text-slate-600',
}

export default function TicketCard({ ticket, selected, onSelect }) {
  const sla = getSlaStatus(ticket.created_at)
  const clientName = ticket.client?.name ?? 'Cliente não encontrado'
  const address = ticket.pool?.local_address ?? 'Localização não disponível'
  const statusLabel = ticketStatusLabel(ticket.status)
  const phone = ticket.client?.phone

  return (
    <article
      className={`${CARD_CLASS} border-l-4 p-4 transition ${
        sla === 'critical' ? 'border-l-red-600' : sla === 'attention' ? 'border-l-amber-500' : 'border-l-primary'
      } ${selected ? 'ring-2 ring-primary/30' : ''}`}
      aria-label={`Pedido ${ticket.id}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${SLA_CLASSES[sla]}`}>
          {formatTicketAge(ticket.created_at)} — SLA {slaLabel(sla)}
        </span>
        <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-primary">
          {ticketCategoryLabel(ticket.category)}
        </span>
        <span className="font-mono text-xs text-slate-500">{ticket.id}</span>
        <StatusBadge
          active={ticket.status !== 'pending'}
          activeLabel={statusLabel}
          inactiveLabel={statusLabel}
        />
        {ticket.priority && (
          <span className="ml-auto text-xs text-slate-500">
            Prioridade: <strong>{ticketPriorityLabel(ticket.priority)}</strong>
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-semibold text-slate-800">{clientName}</h3>
          <p className="mt-0.5 text-sm text-slate-600">{address}</p>
        </div>
        {phone && (
          <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className="text-sm font-medium text-primary hover:underline">
            Contactar
          </a>
        )}
      </div>

      <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{ticket.description}</p>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-slate-500">
          {ticket.pool?.dimensions && <span>Dimensões: {ticket.pool.dimensions}</span>}
          {ticket.pool?.treatment_type && <span>{ticket.pool?.dimensions ? ' · ' : ''}Tratamento: {ticket.pool.treatment_type}</span>}
        </div>
        <button
          type="button"
          onClick={onSelect}
          aria-current={selected ? 'true' : undefined}
          className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
        >
          Triar / Ver detalhes
        </button>
      </div>
    </article>
  )
}
