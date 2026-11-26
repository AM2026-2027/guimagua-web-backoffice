import { formatTime } from '../utils/date'
import {
  APPOINTMENT_STATUS_ORDER,
  appointmentStatusCountLabel,
  appointmentStatusLabel,
  staffRoleLabel,
} from '../utils/labels'
import { getAppointmentTimeRange } from '../utils/timeline'
import { appointmentStatusClass, countAppointmentStatuses } from '../utils/status'

const DAY_START_MINUTE = 8 * 60
const DAY_END_MINUTE = 17 * 60
const HOUR_MARKS = Array.from({ length: 10 }, (_, index) => index + 8)

function getCellLabel(day, person, appointments) {
  const personLabel = `${person.name}, ${staffRoleLabel(person.role)}`
  if (appointments.length === 0) {
    return `${day.fullDateLabel}, ${personLabel}, sem intervenções. Enter abre a agenda do dia.`
  }
  const counts = countAppointmentStatuses(appointments)
  const summary = APPOINTMENT_STATUS_ORDER
    .filter((status) => counts[status] > 0)
    .map((status) => `${counts[status]} ${appointmentStatusCountLabel(status, counts[status])}`)
    .join(', ')
  return `${day.fullDateLabel}, ${personLabel}, ${appointments.length} intervenções: ${summary}. Enter abre a agenda do dia.`
}

function getAppointmentPlacement(appointment, servicesById) {
  const range = getAppointmentTimeRange(appointment, servicesById)
  if (!range) return { kind: 'without-duration', startMinute: null, endMinute: null }
  if (!range.duration) {
    return { kind: 'without-duration', startMinute: range.startMinute, endMinute: null }
  }

  const startMinute = Math.max(range.startMinute, DAY_START_MINUTE)
  const endMinute = Math.min(range.endMinute, DAY_END_MINUTE)
  if (endMinute <= startMinute) {
    return { kind: 'outside-scale', startMinute: range.startMinute, endMinute: range.endMinute }
  }

  return {
    kind: 'positioned',
    startMinute,
    endMinute,
    top: ((startMinute - DAY_START_MINUTE) / (DAY_END_MINUTE - DAY_START_MINUTE)) * 100,
    height: ((endMinute - startMinute) / (DAY_END_MINUTE - DAY_START_MINUTE)) * 100,
  }
}

function assignLanes(appointments, servicesById) {
  const positioned = appointments
    .map((appointment) => ({
      appointment,
      placement: getAppointmentPlacement(appointment, servicesById),
    }))
    .filter(({ placement }) => placement.kind === 'positioned')
    .toSorted((left, right) => left.placement.startMinute - right.placement.startMinute)

  const laneEnds = []
  const items = positioned.map((item) => {
    let lane = laneEnds.findIndex((endMinute) => endMinute <= item.placement.startMinute)
    if (lane === -1) lane = laneEnds.length
    laneEnds[lane] = item.placement.endMinute
    return { ...item, lane }
  })

  return items.map((item) => ({
    ...item,
    laneCount: laneEnds.length,
  }))
}

export default function WeekGridCell({
  day,
  person,
  appointments,
  servicesById,
  tabIndex,
  cellRef,
  onFocus,
  onKeyDown,
  onDaySelect,
}) {
  const positioned = assignLanes(appointments, servicesById)
  const unpositioned = appointments.filter(
    (appointment) => getAppointmentPlacement(appointment, servicesById).kind !== 'positioned',
  )

  return (
    <td
      role="gridcell"
      tabIndex={tabIndex}
      ref={cellRef}
      aria-label={getCellLabel(day, person, appointments)}
      onFocus={onFocus}
      onKeyDown={(event) => onKeyDown(event, day.dateKey, person.id)}
      onClick={(event) => {
        if (event.target.closest('button')) return
        onDaySelect(day.dateKey)
      }}
      className="min-w-36 cursor-pointer align-top border border-slate-200 bg-white p-1 hover:bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
    >
      <div className="relative h-48" aria-label="Escala horária das 08:00 às 17:00">
        <div className="absolute inset-y-0 left-0 w-6 text-[9px] text-slate-500" aria-hidden="true">
          {HOUR_MARKS.filter((hour) => hour === 8 || hour === 12 || hour === 17).map((hour) => (
            <span
              key={hour}
              className="absolute left-0 -translate-y-1/2"
              style={{ top: `${((hour - 8) / 9) * 100}%` }}
            >
              {String(hour).padStart(2, '0')}
            </span>
          ))}
        </div>
        <div className="absolute inset-y-0 left-6 right-0">
          {HOUR_MARKS.map((hour) => (
            <span
              key={hour}
              aria-hidden="true"
              className="absolute inset-x-0 border-t border-slate-100"
              style={{ top: `${((hour - 8) / 9) * 100}%` }}
            />
          ))}
          {positioned.map(({ appointment, placement, lane, laneCount }) => {
            const serviceName = servicesById[appointment.service_id]?.name ?? 'Serviço não identificado'
            const left = (lane / laneCount) * 100
            const width = 100 / laneCount
            return (
              <button
                key={appointment.id}
                type="button"
                onClick={() => onDaySelect(day.dateKey)}
                aria-label={`${formatTime(appointment.date)}, ${person.name}, ${serviceName}, ${appointmentStatusLabel(appointment.status)}. Abrir agenda do dia.`}
                className={`absolute z-10 min-w-0 overflow-hidden rounded border px-0.5 text-left text-[9px] leading-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${appointmentStatusClass(appointment.status)}`}
                style={{
                  top: `${placement.top}%`,
                  height: `${placement.height}%`,
                  left: `calc(${left}% + 1px)`,
                  width: `calc(${width}% - 2px)`,
                }}
              >
                <span className="block truncate font-semibold">
                  {formatTime(appointment.date)} · {serviceName}
                </span>
                <span className="sr-only">{appointmentStatusLabel(appointment.status)}</span>
              </button>
            )
          })}
        </div>
      </div>

      {appointments.length === 0 ? (
        <p className="px-1 pb-1 text-[10px] text-slate-500">Sem intervenções</p>
      ) : (
        <ul className="mt-1 space-y-1" aria-label="Intervenções fora da escala ou sem duração">
          {unpositioned.map((appointment) => {
            const placement = getAppointmentPlacement(appointment, servicesById)
            const serviceName = servicesById[appointment.service_id]?.name ?? 'Serviço não identificado'
            const reason =
              placement.kind === 'without-duration' ? 'duração indisponível' : 'fora da escala'
            return (
              <li key={appointment.id}>
                <button
                  type="button"
                  onClick={() => onDaySelect(day.dateKey)}
                  aria-label={`${formatTime(appointment.date)}, ${person.name}, ${serviceName}, ${reason}, ${appointmentStatusLabel(appointment.status)}. Abrir agenda do dia.`}
                  className={`w-full truncate rounded border px-1 py-1 text-left text-[10px] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${appointmentStatusClass(appointment.status)}`}
                >
                  {formatTime(appointment.date)} · {serviceName} · {reason}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </td>
  )
}
