import LoadingSpinner from '../../../shared/components/LoadingSpinner'
import ErrorAlert from '../../../shared/components/ErrorAlert'
import { CARD_CLASS } from '../../../shared/components/uiClasses'
import { appointmentStatusLabel, formatDateTime } from '../utils/labels'
import { splitAppointments } from '../utils/poolForm'

const DECIMAL = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 2 })

function formatNumber(value, unit) {
  return Number.isFinite(value) ? `${DECIMAL.format(value)}${unit ? ` ${unit}` : ''}` : '—'
}

function Metric({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-xl font-semibold text-slate-800">{value}</dd>
    </div>
  )
}

/**
 * Atividade da piscina, só leitura: última leitura (pool_readings), próxima visita e últimas intervenções
 * (appointments). Registar leituras e reagendar faz-se nas apps e na agenda.
 */
export default function PoolActivityPanel({ activity }) {
  if (activity.loading) return <LoadingSpinner label="A carregar atividade da piscina..." />
  if (activity.error) return <ErrorAlert message={activity.error} />

  const { nextVisit, past } = splitAppointments(activity.appointments, activity.fetchedAt)
  const reading = activity.reading

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <section className={`${CARD_CLASS} p-6 lg:col-span-2`} aria-labelledby="reading-title">
        <h2 id="reading-title" className="text-lg font-semibold text-slate-800">
          Última leitura físico-química
        </h2>
        {reading ? (
          <>
            <p className="mt-1 text-sm text-slate-500">Registada em {formatDateTime(reading.timestamp)}</p>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Metric label="pH" value={formatNumber(reading.ph_level)} />
              <Metric label="Cloro" value={formatNumber(reading.chlorine_ppm, 'ppm')} />
              <Metric label="Temperatura" value={formatNumber(reading.temperature_c, '°C')} />
              <Metric label="Salinidade" value={formatNumber(reading.salinity_gl, 'g/L')} />
            </dl>
          </>
        ) : (
          <p className="mt-2 text-sm text-slate-400">Ainda não há leituras registadas para esta piscina.</p>
        )}
      </section>

      <section className={`${CARD_CLASS} p-6`} aria-labelledby="next-visit-title">
        <h2 id="next-visit-title" className="text-lg font-semibold text-slate-800">
          Próxima visita
        </h2>
        {nextVisit ? (
          <div className="mt-3 rounded-xl bg-primary p-4 text-white">
            <p className="text-lg font-semibold">{formatDateTime(nextVisit.date)}</p>
            <p className="mt-1 text-sm text-white/80">{nextVisit.tech_name ? `Técnico: ${nextVisit.tech_name}` : 'Técnico atribuído na agenda'}</p>
            {nextVisit.notes && <p className="mt-2 text-sm text-white/90">{nextVisit.notes}</p>}
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-400">Sem visitas agendadas.</p>
        )}
      </section>

      <section className={`${CARD_CLASS} p-6 lg:col-span-3`} aria-labelledby="history-title">
        <h2 id="history-title" className="text-lg font-semibold text-slate-800">
          Últimas intervenções
        </h2>
        {past.length === 0 ? (
          <p className="mt-2 text-sm text-slate-400">Sem intervenções registadas.</p>
        ) : (
          <ol className="mt-3 space-y-3">
            {past.map((appointment) => (
              <li key={appointment.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-slate-800">{formatDateTime(appointment.date)}</span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                    {appointmentStatusLabel(appointment.status)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {appointment.tech_name ? `Técnico: ${appointment.tech_name}` : 'Técnico não indicado'}
                  {appointment.anomaly_reported ? ' · Anomalia reportada' : ''}
                  {appointment.report_pdf_path ? ' · Relatório PDF disponível em Relatórios' : ''}
                </p>
                {appointment.notes && <p className="mt-2 text-sm text-slate-700">{appointment.notes}</p>}
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  )
}
