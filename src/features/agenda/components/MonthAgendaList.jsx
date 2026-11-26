import { CARD_CLASS, SECONDARY_BUTTON } from '../../../shared/components/uiClasses'
import { formatLongDate, formatTime, dateKeyOf } from '../utils/date'
import {
  APPOINTMENT_STATUS_ORDER,
  appointmentStatusCountLabel,
  appointmentStatusLabel,
} from '../utils/labels'
import { countAppointmentStatuses } from '../utils/month'
import { sortMonthAppointments } from '../utils/sort'

function statusSummary(appointments) {
  const counts = countAppointmentStatuses(appointments)
  return APPOINTMENT_STATUS_ORDER
    .filter((status) => counts[status] > 0)
    .map((status) => `${counts[status]} ${appointmentStatusCountLabel(status, counts[status])}`)
    .join(', ')
}

export default function MonthAgendaList({
  monthDays,
  appointments,
  staffById,
  servicesById,
  onDaySelect,
}) {
  const appointmentsByDate = new Map()
  for (const appointment of sortMonthAppointments(appointments, staffById)) {
    const dateKey = dateKeyOf(appointment.date)
    if (!dateKey) continue
    const current = appointmentsByDate.get(dateKey) ?? []
    current.push(appointment)
    appointmentsByDate.set(dateKey, current)
  }

  return (
    <section className={`${CARD_CLASS} p-4 md:hidden`} aria-label="Agenda mensal em lista">
      <ol className="space-y-2">
        {monthDays.filter((day) => day.inMonth).map((day) => {
          const dayAppointments = appointmentsByDate.get(day.dateKey) ?? []
          return (
            <li key={day.dateKey} className="rounded-xl border border-slate-200 p-3">
              <button
                type="button"
                onClick={() => onDaySelect(day.dateKey)}
                className={`${SECONDARY_BUTTON} w-full justify-start`}
                aria-label={`${formatLongDate(day.dateKey)}, ${dayAppointments.length} intervenções. Abrir agenda do dia.`}
              >
                <span className="font-semibold">{formatLongDate(day.dateKey)}</span>
                <span className="ml-auto">{dayAppointments.length}</span>
              </button>
              {dayAppointments.length > 0 ? (
                <p className="mt-2 text-xs text-slate-600">
                  {statusSummary(dayAppointments)}
                </p>
              ) : (
                <p className="mt-2 text-xs text-slate-500">Sem intervenções visíveis.</p>
              )}
              {dayAppointments.slice(0, 3).map((appointment) => (
                <p key={appointment.id} className="mt-1 text-xs text-slate-700">
                  {formatTime(appointment.date)} · {staffById[appointment.tech_id]?.name ?? 'Colaborador'} ·{' '}
                  {servicesById[appointment.service_id]?.name ?? 'Serviço'} ·{' '}
                  {appointmentStatusLabel(appointment.status)}
                </p>
              ))}
              {dayAppointments.length > 3 && (
                <p className="mt-1 text-xs font-medium text-primary">+{dayAppointments.length - 3}</p>
              )}
            </li>
          )
        })}
      </ol>
    </section>
  )
}
