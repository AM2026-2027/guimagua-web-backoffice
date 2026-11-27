import { Link } from 'react-router'
import { CARD_CLASS } from '../../../shared/components/uiClasses'
import {
  TICKET_CATEGORY_LABELS,
  TICKET_PRIORITY_CLASSES,
  TICKET_PRIORITY_LABELS,
  TICKET_STATUS_CLASSES,
  TICKET_STATUS_LABELS,
  formatRelativeAge,
  getEnumClass,
  getEnumLabel,
} from '../utils/labels'

export default function RecentTicketsCard({ tickets, clientsById, poolsById }) {
  return (
    <section className={`${CARD_CLASS} p-5 shadow-xs`} aria-labelledby="recent-tickets-heading">
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h2 id="recent-tickets-heading" className="text-base font-semibold text-slate-800">
            Últimos Pedidos Recebidos
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">Submissões recentes de assistência e orçamento da App Cliente</p>
        </div>
        <Link
          to="/tickets"
          className="shrink-0 text-xs font-semibold text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          Ver todos →
        </Link>
      </div>

      {tickets.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-5 text-center text-sm text-slate-500">
          Ainda não existem pedidos de assistência ou orçamento registados.
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-slate-100">
          {tickets.map((ticket) => {
            const client = clientsById[ticket.client_id]
            const pool = poolsById[ticket.pool_id]
            return (
              <li key={ticket.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-slate-800">
                        {client?.name || `Cliente ${ticket.client_id || '—'}`}
                      </span>
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                        {getEnumLabel(TICKET_CATEGORY_LABELS, ticket.category, 'Pedido')}
                      </span>
                      {ticket.priority && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${getEnumClass(
                            TICKET_PRIORITY_CLASSES,
                            ticket.priority,
                          )}`}
                        >
                          Prioridade: {getEnumLabel(TICKET_PRIORITY_LABELS, ticket.priority)}
                        </span>
                      )}
                    </div>
                    {pool && (
                      <p className="mt-0.5 text-xs text-slate-500">{pool.name || pool.local_address}</p>
                    )}
                    {ticket.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-slate-600">{ticket.description}</p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${getEnumClass(
                        TICKET_STATUS_CLASSES,
                        ticket.status,
                      )}`}
                    >
                      {getEnumLabel(TICKET_STATUS_LABELS, ticket.status)}
                    </span>
                    <span className="text-[11px] text-slate-400">{formatRelativeAge(ticket.created_at)}</span>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
