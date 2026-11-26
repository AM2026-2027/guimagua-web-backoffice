import { Link } from 'react-router'
import { CARD_CLASS, LINK_BUTTON } from '../../../shared/components/uiClasses'
import { formatTime, initialsOf, staffRoleLabel } from '../utils/labels'

const STATUS_BADGE = {
  in_progress: {
    label: 'Em execução',
    className: 'bg-sky-50 text-primary ring-sky-200',
  },
  scheduled: {
    label: 'Agendado',
    className: 'bg-amber-50 text-amber-800 ring-amber-200',
  },
  available: {
    label: 'Disponível',
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  },
}

/**
 * Painel lateral "Escala Diária" com progresso em tempo real dos `appointments` de hoje
 * e estado operacional derivado por técnico/comercial ativo.
 */
export default function DailySchedulePanel({ dailySchedule, poolsById }) {
  const { summary, rows } = dailySchedule

  return (
    <section aria-labelledby="daily-schedule-heading" className={`${CARD_CLASS} p-5`}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 id="daily-schedule-heading" className="text-base font-semibold text-slate-800">
            Escala Diária
          </h2>
          <p className="text-xs text-slate-500">Ponto de situação das intervenções de hoje</p>
        </div>
        <Link to="/agenda" className={LINK_BUTTON}>
          Agenda →
        </Link>
      </div>

      <div className="mt-4 rounded-xl bg-slate-50 p-3">
        <div className="flex items-baseline justify-between text-xs">
          <span className="font-medium text-slate-700">
            {summary.completed} de {summary.total} concluídas
          </span>
          <span className="font-semibold text-primary">{summary.completionPct}%</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200" aria-hidden="true">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${summary.completionPct}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
          <span>{summary.completed} concluídas</span>
          <span>{summary.inProgress} em curso</span>
          <span>{summary.scheduled} agendadas</span>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-slate-400">Sem técnicos ou comerciais ativos registados.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.map(({ member, status, activeAppointment, totalToday, doneCount }) => {
            const badge = STATUS_BADGE[status]
            const pool = activeAppointment?.pool_id ? poolsById.get(activeAppointment.pool_id) : null
            const targetName =
              activeAppointment?.client_name || pool?.name || pool?.local_address || 'Intervenção agendada'

            return (
              <li key={member.id} className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span
                      aria-hidden="true"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
                    >
                      {initialsOf(member.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">{member.name || member.email}</p>
                      <p className="text-xs text-slate-500">
                        {staffRoleLabel(member.role)} · {doneCount}/{totalToday} hoje
                      </p>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${badge.className}`}>
                    {badge.label}
                  </span>
                </div>

                {activeAppointment ? (
                  <p className="mt-2 text-xs text-slate-600">
                    <span className="font-medium text-slate-800">{targetName}</span> ·{' '}
                    {status === 'in_progress'
                      ? `Iniciada às ${formatTime(activeAppointment.checkin_timestamp || activeAppointment.date)}`
                      : `Prevista às ${formatTime(activeAppointment.date)}`}
                  </p>
                ) : (
                  <p className="mt-2 text-xs text-slate-400">Disponível para atribuição na agenda.</p>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
