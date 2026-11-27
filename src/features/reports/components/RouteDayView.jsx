import { CARD_CLASS } from '../../../shared/components/uiClasses'
import StatusPill from './StatusPill'
import { checkinDelayMinutes, formatTime } from '../utils/dates'

function Summary({ label, value }) {
  return (
    <div className={`${CARD_CLASS} p-4`}>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-800">{value}</p>
    </div>
  )
}

/** Rota do dia (apresentacional): resumo e visitas por ordem de hora, com o atraso do check-in. */
export default function RouteDayView({ visits }) {
  const count = (status) => visits.filter((visit) => visit.status === status).length

  return (
    <div className="space-y-4">
      <section aria-label="Resumo do dia" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Summary label="Visitas" value={visits.length} />
        <Summary label="Concluídas" value={count('completed')} />
        <Summary label="Em curso" value={count('in_progress')} />
        <Summary label="Por iniciar" value={count('scheduled')} />
        <Summary label="Canceladas" value={count('cancelled')} />
      </section>

      <ol className="space-y-3" aria-label="Visitas do dia por ordem de hora">
        {visits.map((visit, position) => {
          const delay = checkinDelayMinutes(visit)
          return (
            <li key={visit.id} className={`${CARD_CLASS} flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between`}>
              <div className="flex items-start gap-4">
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
                >
                  {position + 1}
                </span>
                <div>
                  <p className="font-medium text-slate-800">
                    {formatTime(visit.date)} · {visit.clientName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {visit.poolName} · {visit.serviceName}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                <span>
                  Check-in: <strong>{formatTime(visit.checkin_timestamp)}</strong>
                  {delay !== null && (
                    <span className={delay > 15 ? 'ml-1 text-amber-700' : 'ml-1 text-slate-500'}>
                      ({delay > 0 ? `+${delay}` : delay} min)
                    </span>
                  )}
                </span>
                <StatusPill status={visit.status} />
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
