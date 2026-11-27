import { CARD_CLASS } from '../../../shared/components/uiClasses'
import { formatTicketDate } from '../utils/labels'

export default function ClientProfileCard({ client, activePoolCount }) {
  if (!client) {
    return (
      <section className={`${CARD_CLASS} p-5`} aria-labelledby="ticket-client-title">
        <h2 id="ticket-client-title" className="font-semibold text-slate-800">
          Perfil do titular
        </h2>
        <p className="mt-2 text-sm text-slate-500">Os dados do cliente não estão disponíveis.</p>
      </section>
    )
  }

  return (
    <section className={`${CARD_CLASS} space-y-4 p-5`} aria-labelledby="ticket-client-title">
      <div>
        <h2 id="ticket-client-title" className="font-semibold text-slate-800">
          Perfil do titular
        </h2>
        <p className="mt-1 text-lg font-semibold text-slate-800">{client.name}</p>
        {client.created_at && (
          <p className="text-xs text-slate-500">
            Cliente desde {formatTicketDate(client.created_at)}
          </p>
        )}
      </div>

      <dl className="space-y-3 text-sm">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Piscinas ativas</dt>
          <dd className="mt-1 text-slate-700">{activePoolCount ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Telefone</dt>
          <dd className="mt-1">
            {client.phone ? (
              <a
                href={`tel:${client.phone.replace(/[^\d+]/g, '')}`}
                className="break-all text-primary hover:underline"
              >
                {client.phone}
              </a>
            ) : (
              <span className="text-slate-500">Não indicado</span>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Email</dt>
          <dd className="mt-1">
            {client.email ? (
              <a href={`mailto:${client.email}`} className="break-all text-primary hover:underline">
                {client.email}
              </a>
            ) : (
              <span className="text-slate-500">Não indicado</span>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Morada de faturação</dt>
          <dd className="mt-1 text-slate-700">{client.address || 'Não indicada'}</dd>
        </div>
      </dl>
      <p className="text-xs text-slate-500">Não existe informação de selo VIP ou contrato neste registo.</p>
    </section>
  )
}
