import ErrorAlert from '../../../shared/components/ErrorAlert'
import { CARD_CLASS, SECONDARY_BUTTON } from '../../../shared/components/uiClasses'
import { formatTicketDateTime } from '../utils/labels'

export default function PoolInterventionsPanel({
  appointments,
  hasMore,
  loadingMore,
  error,
  onLoadMore,
}) {
  return (
    <section className={`${CARD_CLASS} p-5`} aria-labelledby="pool-interventions-title">
      <h2 id="pool-interventions-title" className="font-semibold text-slate-800">
        Histórico de intervenções
      </h2>

      {appointments.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">Não há intervenções concluídas registadas.</p>
      ) : (
        <ol className="mt-3 space-y-3">
          {appointments.map((appointment) => (
            <li key={appointment.id} className="rounded-lg border border-slate-200 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <time className="text-sm font-medium text-slate-800">
                  {formatTicketDateTime(appointment.date)}
                </time>
                <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800">
                  Concluída
                </span>
              </div>
              {appointment.tech_name && (
                <p className="mt-1 text-xs text-slate-500">Técnico: {appointment.tech_name}</p>
              )}
              {appointment.notes && (
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{appointment.notes}</p>
              )}
            </li>
          ))}
        </ol>
      )}

      <ErrorAlert message={error} />
      {hasMore && (
        <button
          type="button"
          onClick={onLoadMore}
          disabled={loadingMore}
          className={`${SECONDARY_BUTTON} mt-3 w-full`}
        >
          {loadingMore ? 'A carregar...' : 'Carregar mais intervenções'}
        </button>
      )}
    </section>
  )
}
