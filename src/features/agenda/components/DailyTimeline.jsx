import { CARD_CLASS } from '../../../shared/components/uiClasses'
import { appointmentStatusLabel, staffRoleLabel } from '../utils/labels'
import { dateKeyOf, minutesInLisbon } from '../utils/date'
import {
  WORKDAY_END_MINUTE,
  WORKDAY_START_MINUTE,
  appointmentInterval,
  occupiesStaff,
} from '../utils/schedule'
import { sortAppointments } from '../utils/sort'

// Grelha do dia de trabalho (08:00–19:00): uma coluna por hora.
const DAY_START_MINUTE = WORKDAY_START_MINUTE
const DAY_END_MINUTE = WORKDAY_END_MINUTE
const HOUR_COLUMNS = Array.from(
  { length: (DAY_END_MINUTE - DAY_START_MINUTE) / 60 },
  (_, index) => `${String(DAY_START_MINUTE / 60 + index).padStart(2, '0')}:00`,
)
const GRID_STYLE = { gridTemplateColumns: `repeat(${HOUR_COLUMNS.length}, minmax(0, 1fr))` }

function getAppointmentSpan(appointment, servicesById) {
  // O mesmo cálculo de início/fim usado na verificação de sobreposições (utils/schedule.js).
  const interval = appointmentInterval(appointment, servicesById)
  if (!interval) return null
  const { start, end } = interval

  const startMinute = minutesInLisbon(start)
  const endMinute = minutesInLisbon(end) + (dateKeyOf(end) !== dateKeyOf(start) ? 24 * 60 : 0)
  const clippedStart = Math.max(startMinute, DAY_START_MINUTE)
  const clippedEnd = Math.min(endMinute, DAY_END_MINUTE)
  if (clippedEnd <= clippedStart) return null

  return {
    left: ((clippedStart - DAY_START_MINUTE) / (DAY_END_MINUTE - DAY_START_MINUTE)) * 100,
    width: ((clippedEnd - clippedStart) / (DAY_END_MINUTE - DAY_START_MINUTE)) * 100,
    start,
  }
}

function appointmentLabel(appointment, staffById, poolsById, clientsById, servicesById) {
  const staff = staffById[appointment.tech_id]
  const pool = poolsById[appointment.pool_id]
  const client = clientsById[pool?.client_id]
  const service = servicesById[appointment.service_id]
  const time = minutesInLisbon(appointment.date)
  const timeLabel =
    time == null
      ? 'Hora desconhecida'
      : `${String(Math.floor(time / 60)).padStart(2, '0')}:${String(time % 60).padStart(2, '0')}`
  return [
    `ID ${appointment.id}`,
    timeLabel,
    staff?.name ?? 'Colaborador não identificado',
    client?.name ?? 'Cliente não identificado',
    pool?.local_address ?? 'Morada não disponível',
    service?.name ?? 'Serviço não identificado',
    appointmentStatusLabel(appointment.status),
  ]
    .filter(Boolean)
    .join(' · ')
}

export default function DailyTimeline({
  dateKey,
  appointments,
  staff,
  staffById,
  poolsById,
  clientsById,
  servicesById,
  now,
  hasAnyAppointments,
  onSelect,
}) {
  const staffRows = staff
    .filter(
      (person) =>
        person.is_active !== false ||
        appointments.some((appointment) => appointment.tech_id === person.id),
    )
    .toSorted((left, right) => left.name.localeCompare(right.name, 'pt-PT'))
  const sortedAppointments = sortAppointments(appointments)
  const visibleNow = dateKeyOf(now) === dateKey ? minutesInLisbon(now) : null
  const nowPosition =
    visibleNow != null && visibleNow >= DAY_START_MINUTE && visibleNow <= DAY_END_MINUTE
      ? ((visibleNow - DAY_START_MINUTE) / (DAY_END_MINUTE - DAY_START_MINUTE)) * 100
      : null
  // Os cancelados libertam o horário: não ocupam a linha do colaborador, só aparecem na lista abaixo.
  const timelineAppointments = sortedAppointments.filter(occupiesStaff)
  const cancelledCount = sortedAppointments.length - timelineAppointments.length
  const appointmentsWithoutDuration = timelineAppointments.filter(
    (appointment) => !getAppointmentSpan(appointment, servicesById),
  )

  return (
    <section className={`${CARD_CLASS} p-4`} aria-labelledby="agenda-timeline-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="agenda-timeline-title" className="text-lg font-semibold text-slate-800">
            Disponibilidade e agenda horária
          </h2>
          <p className="text-xs text-slate-500">08:00–19:00 · horários apresentados em Europe/Lisbon</p>
        </div>
        <ul className="flex flex-wrap gap-3 text-xs text-slate-600" aria-label="Legenda dos estados">
          {[
            ['scheduled', 'Agendado'],
            ['in_progress', 'Em curso'],
            ['completed', 'Concluído'],
          ].map(([value, label]) => (
            <li key={value} className="inline-flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className={`h-3 w-3 rounded-sm border ${
                  value === 'in_progress'
                    ? 'border-primary bg-primary'
                    : value === 'scheduled'
                      ? 'border-primary/40 bg-white'
                      : 'border-slate-300 bg-slate-100'
                }`}
              />
              {label}
            </li>
          ))}
        </ul>
      </div>

      {appointments.length === 0 ? (
        <p className="mt-4 rounded-xl bg-background p-5 text-center text-sm text-slate-600">
          {hasAnyAppointments
            ? 'Nenhuma intervenção corresponde aos filtros selecionados.'
            : 'Não há intervenções registadas para este dia.'}
        </p>
      ) : (
        <>
          <div className="mt-4 overflow-x-auto">
            <div className="min-w-[900px]">
              <div className="grid grid-cols-[190px_minmax(0,1fr)] border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-600">
                <div className="px-3 py-2">Técnico / comercial</div>
                <div className="grid" style={GRID_STYLE}>
                  {HOUR_COLUMNS.map((label) => (
                    <div key={label} className="border-l border-slate-200 px-1 py-2 text-center">
                      {label}
                    </div>
                  ))}
                </div>
              </div>

              {staffRows.length === 0 ? (
                <div className="border-b border-slate-200 px-3 py-5 text-sm text-slate-500">
                  Não há colaboradores disponíveis para apresentar.
                </div>
              ) : (
                staffRows.map((person) => {
                  const personAppointments = timelineAppointments.filter(
                    (appointment) => appointment.tech_id === person.id,
                  )
                  return (
                    <div
                      key={person.id}
                      className="grid grid-cols-[190px_minmax(0,1fr)] border-b border-slate-200 last:border-b-0"
                    >
                      <div className="flex flex-col justify-center px-3 py-2">
                        <span className="text-sm font-medium text-slate-800">{person.name}</span>
                        <span className="text-xs text-slate-500">{staffRoleLabel(person.role)}</span>
                      </div>
                      <div className="relative min-h-16">
                        <div className="absolute inset-0 grid" style={GRID_STYLE} aria-hidden="true">
                          {HOUR_COLUMNS.map((label) => (
                            <span key={label} className="border-l border-slate-100" />
                          ))}
                        </div>
                        {nowPosition != null && (
                          <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-y-0 z-10 border-l-2 border-primary"
                            style={{ left: `${nowPosition}%` }}
                          />
                        )}
                        {personAppointments.map((appointment) => {
                          const span = getAppointmentSpan(appointment, servicesById)
                          if (!span) return null
                          const service = servicesById[appointment.service_id]
                          const pool = poolsById[appointment.pool_id]
                          const client = clientsById[pool?.client_id]
                          const statusClass =
                            appointment.status === 'in_progress'
                              ? 'border-primary bg-primary text-white'
                              : appointment.status === 'scheduled'
                                ? 'border-primary/40 bg-white text-primary'
                                : 'border-slate-300 bg-slate-100 text-slate-700'
                          return (
                            <button
                              type="button"
                              key={appointment.id}
                              onClick={() => onSelect(appointment.id)}
                              aria-label={appointmentLabel(
                                appointment,
                                staffById,
                                poolsById,
                                clientsById,
                                servicesById,
                              )}
                              className={`absolute top-2 z-20 min-w-12 overflow-hidden rounded-lg border px-2 py-1 text-left text-xs shadow-sm hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 ${statusClass}`}
                              style={{
                                left: `${span.left}%`,
                                width: `${span.width}%`,
                              }}
                            >
                              <span className="block truncate font-semibold">
                                {span.start.toLocaleTimeString('pt-PT', {
                                  timeZone: 'Europe/Lisbon',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}{' '}
                                · {client?.name ?? service?.name ?? 'Intervenção'}
                              </span>
                              <span className="block truncate">
                                {pool?.local_address ?? service?.name ?? appointmentStatusLabel(appointment.status)}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {nowPosition != null && (
            <p className="mt-2 text-xs text-primary" aria-live="polite">
              Hora atual: {now.toLocaleTimeString('pt-PT', { timeZone: 'Europe/Lisbon', hour: '2-digit', minute: '2-digit' })}
            </p>
          )}

          {cancelledCount > 0 && (
            <p className="mt-3 text-sm text-slate-600">
              {cancelledCount === 1
                ? 'Um agendamento cancelado não ocupa a agenda; consulte-o na lista abaixo.'
                : `${cancelledCount} agendamentos cancelados não ocupam a agenda; consulte-os na lista abaixo.`}
            </p>
          )}

          {appointmentsWithoutDuration.length > 0 && (
            <p className="mt-3 text-sm text-slate-600">
              {appointmentsWithoutDuration.length === 1
                ? 'Uma intervenção fora do horário 08:00–19:00 (ou sem hora) não aparece na timeline; consulte a lista abaixo.'
                : `${appointmentsWithoutDuration.length} intervenções fora do horário 08:00–19:00 (ou sem hora) não aparecem na timeline; consulte a lista abaixo.`}
            </p>
          )}

          <details className="mt-4 border-t border-slate-200 pt-3">
            <summary className="cursor-pointer rounded text-sm font-medium text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
              Ver agenda em lista acessível ({sortedAppointments.length})
            </summary>
            <ol className="mt-3 space-y-2">
              {sortedAppointments.map((appointment) => (
                <li key={appointment.id} className="rounded-lg border border-slate-200 p-3 text-sm">
                  <p className="font-medium text-slate-800">
                    {appointmentLabel(appointment, staffById, poolsById, clientsById, servicesById)}
                  </p>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <p className="text-xs text-slate-500">ID: {appointment.id}</p>
                    <button
                      type="button"
                      onClick={() => onSelect(appointment.id)}
                      className="rounded text-xs font-medium text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                      Ver detalhe
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          </details>
        </>
      )}
    </section>
  )
}
