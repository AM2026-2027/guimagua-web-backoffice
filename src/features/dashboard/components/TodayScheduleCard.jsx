import { Link } from 'react-router'
import { CARD_CLASS } from '../../../shared/components/uiClasses'
import {
  APPOINTMENT_STATUS_CLASSES,
  APPOINTMENT_STATUS_LABELS,
  formatLisbonTime,
  getEnumClass,
  getEnumLabel,
} from '../utils/labels'

export default function TodayScheduleCard({ appointments, poolsById, clientsById, staffById }) {
  const total = appointments.length
  const completed = appointments.filter((item) => item.status === 'completed').length
  const inProgress = appointments.filter((item) => item.status === 'in_progress').length
  const scheduled = appointments.filter((item) => item.status === 'scheduled').length
  const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <section className={`${CARD_CLASS} p-5 shadow-xs`} aria-labelledby="today-schedule-heading">
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h2 id="today-schedule-heading" className="text-base font-semibold text-slate-800">
            Escala Diária
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">Intervenções agendadas para hoje (hora de Lisboa)</p>
        </div>
        <Link
          to="/agenda"
          className="shrink-0 text-xs font-semibold text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          Ver agenda →
        </Link>
      </div>

      <div className="mt-3 rounded-lg bg-slate-50 p-3">
        <div className="flex items-center justify-between text-xs font-medium text-slate-700">
          <span>
            {completed} de {total} concluída{completed === 1 ? '' : 's'}
          </span>
          <span className="font-semibold text-primary">{completionPct}%</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200" aria-hidden="true">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${completionPct}%` }} />
        </div>
        <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-slate-600">
          <span>Agendadas: {scheduled}</span>
          <span>Em curso: {inProgress}</span>
          <span>Concluídas: {completed}</span>
        </div>
      </div>

      {total === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-5 text-center text-sm text-slate-500">
          Sem intervenções agendadas para hoje.
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-slate-100">
          {appointments.map((appointment) => {
            const pool = poolsById[appointment.pool_id]
            const client = clientsById[appointment.client_id || pool?.client_id]
            const staff = staffById[appointment.tech_id]
            const clientLabel = appointment.client_name || client?.name || 'Cliente não associado'
            const techLabel = appointment.tech_name || staff?.name || 'Colaborador por atribuir'
            const poolLabel = pool?.name || pool?.local_address

            return (
              <li key={appointment.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-primary">{formatLisbonTime(appointment.date)}</span>
                    <span className="truncate text-sm font-medium text-slate-800">{clientLabel}</span>
                    {appointment.anomaly_reported && (
                      <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700 ring-1 ring-red-200">
                        Anomalia
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-slate-500">
                    {techLabel}
                    {poolLabel ? ` · ${poolLabel}` : ''}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${getEnumClass(
                    APPOINTMENT_STATUS_CLASSES,
                    appointment.status,
                  )}`}
                >
                  {getEnumLabel(APPOINTMENT_STATUS_LABELS, appointment.status)}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
