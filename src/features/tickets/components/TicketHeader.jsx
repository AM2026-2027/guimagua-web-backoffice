import { Link } from 'react-router'
import StatusBadge from '../../../shared/components/StatusBadge'
import { LINK_BUTTON, PRIMARY_BUTTON, SECONDARY_BUTTON } from '../../../shared/components/uiClasses'
import { ticketCategoryLabel, ticketPriorityLabel, ticketStatusLabel } from '../utils/labels'

export default function TicketHeader({ ticket, onBack, onChangeStatus, onOpenResponse }) {
  const action =
    ticket.status === 'pending'
      ? { label: 'Alterar Estado', onClick: onChangeStatus }
      : ticket.status === 'in_analysis'
        ? { label: 'Registar Resposta', onClick: onOpenResponse }
        : null

  return (
    <header className="space-y-4">
      <nav aria-label="Navegação estrutural" className="text-sm text-slate-500">
        <button type="button" onClick={onBack} className={LINK_BUTTON}>
          Pedidos
        </button>
        <span aria-hidden="true"> › </span>
        <span className="text-slate-700">
          {ticket.id} — {ticketCategoryLabel(ticket.category)}
        </span>
      </nav>

      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Detalhe do pedido</p>
          <h1 className="mt-1 break-words text-2xl font-bold text-slate-800">
            Detalhes do Pedido #{ticket.id}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusBadge
              active={ticket.status !== 'pending'}
              activeLabel={ticketStatusLabel(ticket.status)}
              inactiveLabel={ticketStatusLabel(ticket.status)}
            />
            <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-primary">
              {ticketCategoryLabel(ticket.category)}
            </span>
            <span className="rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-600">
              Prioridade: {ticketPriorityLabel(ticket.priority)}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {action && (
            <button type="button" onClick={action.onClick} className={PRIMARY_BUTTON}>
              {action.label}
            </button>
          )}
          <Link to="/agenda" className={SECONDARY_BUTTON}>
            Agendar Técnico Especialista
          </Link>
        </div>
      </div>
    </header>
  )
}
