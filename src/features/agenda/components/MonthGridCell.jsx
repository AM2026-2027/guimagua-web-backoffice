import { formatTime } from '../utils/date'
import {
  APPOINTMENT_STATUS_ORDER,
  appointmentStatusCountLabel,
  appointmentStatusLabel,
} from '../utils/labels'
import { countAppointmentStatuses } from '../utils/month'
import { appointmentStatusClass } from '../utils/status'

function makeAccessibleName(day, appointments) {
  if (!day.inMonth) return `${day.fullDateLabel}, fora do mês apresentado. Abrir agenda do dia.`
  if (appointments.length === 0) return `${day.fullDateLabel}, sem intervenções visíveis. Abrir agenda do dia.`

  const counts = countAppointmentStatuses(appointments)
  const summary = APPOINTMENT_STATUS_ORDER
    .filter((status) => counts[status] > 0)
    .map((status) => `${counts[status]} ${appointmentStatusCountLabel(status, counts[status])}`)
    .join(', ')
  return `${day.fullDateLabel}, ${appointments.length} intervenções visíveis: ${summary}. Abrir agenda do dia.`
}

export default function MonthGridCell({
  day,
  appointments,
  staffById,
  servicesById,
  todayKey,
  tabIndex,
  onSelect,
  onFocus,
  onKeyDown,
  buttonRef,
}) {
  const preview = appointments.slice(0, 3)
  const extraCount = appointments.length - preview.length

  return (
    <td
      role="gridcell"
      className={`h-32 min-w-32 align-top border border-slate-200 p-1 ${
        day.inMonth ? 'bg-white' : 'bg-slate-50'
      }`}
    >
      <button
        ref={buttonRef}
        type="button"
        tabIndex={tabIndex}
        aria-label={makeAccessibleName(day, appointments)}
        aria-current={day.dateKey === todayKey ? 'date' : undefined}
        onClick={() => onSelect(day.dateKey)}
        onFocus={() => onFocus(day.dateKey)}
        onKeyDown={(event) => onKeyDown(event, day.dateKey)}
        className="flex h-full w-full flex-col rounded-lg p-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
      >
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
            day.dateKey === todayKey
              ? 'bg-primary text-white'
              : day.inMonth
                ? 'text-slate-800'
                : 'text-slate-400'
          }`}
        >
          {day.dayNumber}
        </span>
        {day.inMonth && appointments.length === 0 && (
          <span className="mt-1 text-xs text-slate-400">Sem intervenções</span>
        )}
        {preview.map((appointment) => {
          const staffName = staffById[appointment.tech_id]?.name ?? 'Colaborador'
          const serviceName = servicesById[appointment.service_id]?.name ?? 'Serviço'
          return (
            <span
              key={appointment.id}
              className={`mt-1 block w-full truncate rounded border px-1 py-0.5 text-left text-[11px] leading-4 ${appointmentStatusClass(appointment.status)}`}
            >
              <span className="font-semibold">{formatTime(appointment.date)}</span>
              {' · '}
              {staffName}
              {' · '}
              {serviceName}
              <span className="sr-only"> · {appointmentStatusLabel(appointment.status)}</span>
            </span>
          )
        })}
        {extraCount > 0 && (
          <span className="mt-1 text-xs font-medium text-primary">+{extraCount}</span>
        )}
      </button>
    </td>
  )
}
