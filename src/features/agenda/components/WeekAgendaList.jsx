import { CARD_CLASS, SECONDARY_BUTTON } from '../../../shared/components/uiClasses'
import { dateKeyOf, formatLongDate, formatTime } from '../utils/date'
import { appointmentStatusLabel, staffRoleLabel } from '../utils/labels'
import { sortAppointments } from '../utils/sort'

export default function WeekAgendaList({
  appointments,
  staffById,
  servicesById,
  onDaySelect,
}) {
  const sortedAppointments = sortAppointments(appointments)
  const content = sortedAppointments.length > 0 ? (
    <ol className="space-y-2">
      {sortedAppointments.map((appointment) => {
        const dateKey = dateKeyOf(appointment.date)
        const staffMember = staffById[appointment.tech_id]
        const staffLabel = staffMember
          ? `${staffMember.name} (${staffRoleLabel(staffMember.role)})`
          : 'Colaborador não identificado'
        const serviceName = servicesById[appointment.service_id]?.name ?? 'Serviço não identificado'
        const accessibleName = [
          dateKey ? formatLongDate(dateKey) : 'Data indisponível',
          formatTime(appointment.date),
          staffLabel,
          serviceName,
          appointmentStatusLabel(appointment.status),
          'Abrir agenda do dia.',
        ].join(', ')

        return (
          <li key={appointment.id} className="rounded-xl border border-slate-200 p-3">
            <button
              type="button"
              onClick={() => dateKey && onDaySelect(dateKey)}
              aria-label={accessibleName}
              disabled={!dateKey}
              className={`${SECONDARY_BUTTON} w-full justify-start`}
            >
              <span className="min-w-0 text-left">
                <span className="block font-semibold text-slate-800">
                  {dateKey ? formatLongDate(dateKey) : 'Data indisponível'} · {formatTime(appointment.date)}
                </span>
                <span className="mt-1 block truncate text-xs text-slate-600">
                  {staffLabel} · {serviceName} · {appointmentStatusLabel(appointment.status)}
                </span>
              </span>
            </button>
          </li>
        )
      })}
    </ol>
  ) : (
    <p className="rounded-xl bg-background p-5 text-center text-sm text-slate-600">
      Não há intervenções que correspondam aos filtros selecionados.
    </p>
  )

  return (
    <>
      <section className={`${CARD_CLASS} p-4 md:hidden`} aria-label="Agenda semanal em lista cronológica">
        <h2 className="mb-3 text-base font-semibold text-slate-800">Lista cronológica</h2>
        {content}
      </section>
      <details className={`${CARD_CLASS} hidden p-4 md:block`}>
        <summary className="cursor-pointer rounded text-sm font-medium text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
          Ver lista cronológica acessível ({sortedAppointments.length})
        </summary>
        <div className="mt-3">{content}</div>
      </details>
    </>
  )
}
