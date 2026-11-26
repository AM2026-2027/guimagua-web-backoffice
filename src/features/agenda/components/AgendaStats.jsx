import { CARD_CLASS } from '../../../shared/components/uiClasses'

const NUMBER_FORMAT = new Intl.NumberFormat('pt-PT')

function StatCard({ label, value, hint }) {
  return (
    <article className={`${CARD_CLASS} p-4`}>
      <h2 className="text-sm text-slate-500">{label}</h2>
      <p className="mt-2 text-2xl font-semibold text-slate-800">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </article>
  )
}

export default function AgendaStats({ appointments, staffById, servicesById }) {
  const scheduledToday = appointments.filter((appointment) => appointment.status !== 'cancelled')
  const completed = scheduledToday.filter((appointment) => appointment.status === 'completed').length
  const inProgress = scheduledToday.filter((appointment) => appointment.status === 'in_progress').length
  const scheduled = scheduledToday.filter((appointment) => appointment.status === 'scheduled').length
  const techniciansInField = new Set(
    scheduledToday
      .filter(
        (appointment) =>
          appointment.status === 'in_progress' &&
          staffById[appointment.tech_id]?.role === 'technician',
      )
      .map((appointment) => appointment.tech_id),
  ).size
  const durations = scheduledToday
    .map((appointment) => Number(servicesById[appointment.service_id]?.default_duration_min))
    .filter((duration) => Number.isFinite(duration) && duration > 0)
  const averagePlannedDuration =
    durations.length > 0
      ? `${NUMBER_FORMAT.format(Math.round(durations.reduce((sum, duration) => sum + duration, 0) / durations.length))} min`
      : '—'

  return (
    <section aria-label="Indicadores do dia" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Intervenções hoje"
        value={NUMBER_FORMAT.format(scheduledToday.length)}
        hint={`${completed} concluídas · ${inProgress} em curso · ${scheduled} agendadas`}
      />
      <StatCard label="Técnicos no terreno" value={NUMBER_FORMAT.format(techniciansInField)} hint="Com intervenção em curso" />
      <StatCard label="Duração prevista média" value={averagePlannedDuration} hint="Estimativa pelo catálogo de serviços" />
      <StatCard label="Cumprimento de SLA" value="—" hint="Sem dados de SLA no modelo atual" />
    </section>
  )
}
