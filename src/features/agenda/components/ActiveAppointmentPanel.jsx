import { Link } from 'react-router'
import ErrorAlert from '../../../shared/components/ErrorAlert'
import LoadingSpinner from '../../../shared/components/LoadingSpinner'
import { CARD_CLASS, SECONDARY_BUTTON } from '../../../shared/components/uiClasses'
import { formatTime } from '../utils/date'
import { serviceTypeLabel } from '../utils/labels'

const DECIMAL_FORMAT = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 2 })

function formatReading(value, unit = '') {
  return Number.isFinite(value) ? `${DECIMAL_FORMAT.format(value)}${unit ? ` ${unit}` : ''}` : '—'
}

function getReadingAlerts(reading, thresholds) {
  if (!thresholds) return []
  const alerts = []
  if (Number.isFinite(reading.ph_level) && (reading.ph_level < thresholds.ph_min || reading.ph_level > thresholds.ph_max)) {
    alerts.push('pH')
  }
  if (
    Number.isFinite(reading.chlorine_ppm) &&
    (reading.chlorine_ppm < thresholds.chlorine_min_ppm || reading.chlorine_ppm > thresholds.chlorine_max_ppm)
  ) {
    alerts.push('cloro')
  }
  if (
    Number.isFinite(reading.temperature_c) &&
    (reading.temperature_c < thresholds.temperature_min_c || reading.temperature_c > thresholds.temperature_max_c)
  ) {
    alerts.push('temperatura')
  }
  return alerts
}

function hasCompleteThresholds(thresholds) {
  return [
    thresholds?.ph_min,
    thresholds?.ph_max,
    thresholds?.chlorine_min_ppm,
    thresholds?.chlorine_max_ppm,
    thresholds?.temperature_min_c,
    thresholds?.temperature_max_c,
  ].every(Number.isFinite)
}

function ReadingMetric({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-1 text-lg font-semibold text-primary">{value}</dd>
    </div>
  )
}

export default function ActiveAppointmentPanel({ appointment, detail, client, pool, staff, service }) {
  if (!appointment) {
    return (
      <section className={`${CARD_CLASS} p-5`} aria-labelledby="active-appointment-title">
        <h2 id="active-appointment-title" className="text-lg font-semibold text-slate-800">
          Intervenção em curso
        </h2>
        <p className="mt-2 text-sm text-slate-500">Não há nenhuma intervenção em curso neste dia.</p>
      </section>
    )
  }

  const checklist = Array.isArray(service?.checklist_template) ? service.checklist_template : []
  const checklistResults = appointment.checklist_results ?? {}
  const completedCount = checklist.filter((item) => checklistResults[item] === true).length
  const progress = checklist.length > 0 ? Math.round((completedCount / checklist.length) * 100) : 0
  const reading = detail.reading
  const thresholdsReady = hasCompleteThresholds(detail.thresholds)
  const readingAlerts = reading && thresholdsReady ? getReadingAlerts(reading, detail.thresholds) : []
  const readingError = detail.error || detail.thresholdsError

  return (
    <section className={`${CARD_CLASS} border-l-4 border-l-primary p-5`} aria-labelledby="active-appointment-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Intervenção em curso</p>
          <h2 id="active-appointment-title" className="mt-1 text-lg font-semibold text-slate-800">
            {client?.name ?? 'Cliente não identificado'}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {pool?.name || pool?.local_address || 'Piscina sem identificação'}
          </p>
        </div>
        <span className="rounded-lg bg-background px-3 py-2 text-xs font-medium text-slate-600">
          ID {appointment.id}
        </span>
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Técnico</dt>
          <dd className="mt-1 text-sm text-slate-800">{staff?.name ?? 'Colaborador não identificado'}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Serviço</dt>
          <dd className="mt-1 text-sm text-slate-800">
            {service?.name ?? 'Serviço não identificado'}
            {service?.type ? ` · ${serviceTypeLabel(service.type)}` : ''}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Check-in</dt>
          <dd className="mt-1 text-sm text-slate-800">{formatTime(appointment.checkin_timestamp)}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Morada</dt>
          <dd className="mt-1 text-sm text-slate-800">{pool?.local_address ?? client?.address ?? '—'}</dd>
        </div>
      </dl>

      <div className="mt-5">
        <div className="flex items-center justify-between gap-2 text-sm">
          <h3 className="font-semibold text-slate-800">Checklist</h3>
          <span className="text-slate-500">
            {checklist.length > 0 ? `${completedCount}/${checklist.length} · ${progress}%` : 'Sem itens definidos'}
          </span>
        </div>
        {checklist.length > 0 && (
          <>
            <div
              className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-label="Progresso da checklist"
              aria-valuemin={0}
              aria-valuemax={checklist.length}
              aria-valuenow={completedCount}
            >
              <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
            </div>
            <ul className="mt-3 space-y-2">
              {checklist.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                  <span aria-hidden="true" className="mt-0.5">
                    {checklistResults[item] === true ? '✓' : '○'}
                  </span>
                  <span>{item}</span>
                  <span className="sr-only">{checklistResults[item] === true ? 'Concluído' : 'Por concluir'}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="mt-5 rounded-xl bg-background p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-800">Última leitura da piscina</h3>
          {reading?.timestamp && (
            <span className="text-xs text-slate-500">Registada às {formatTime(reading.timestamp)}</span>
          )}
        </div>
        {detail.loading || detail.thresholdsLoading ? (
          <LoadingSpinner label="A carregar leitura e limiares..." />
        ) : readingError ? (
          <div className="mt-3">
            <ErrorAlert message={readingError} />
          </div>
        ) : reading ? (
          <>
            <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <ReadingMetric label="pH" value={formatReading(reading.ph_level)} />
              <ReadingMetric label="Cloro" value={formatReading(reading.chlorine_ppm, 'ppm')} />
              <ReadingMetric label="Temperatura" value={formatReading(reading.temperature_c, '°C')} />
              <ReadingMetric label="Salinidade" value={formatReading(reading.salinity_gl, 'g/L')} />
            </dl>
            <p className="mt-3 text-sm font-medium text-slate-700" role="status">
              {!detail.thresholds
                ? 'Limiares de alerta não configurados.'
                : !thresholdsReady
                  ? 'Limiares de alerta incompletos.'
                : readingAlerts.length > 0
                  ? `Alerta: ${readingAlerts.join(', ')} fora dos limiares configurados.`
                  : 'Leitura dentro dos limiares configurados.'}
            </p>
          </>
        ) : (
          <p className="mt-3 text-sm text-slate-500">Ainda não há leituras registadas para esta piscina.</p>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {client?.id ? (
          <Link to={`/clients?client=${encodeURIComponent(client.id)}`} className={SECONDARY_BUTTON}>
            Ficha Cliente
          </Link>
        ) : (
          <button type="button" disabled className={SECONDARY_BUTTON}>
            Ficha Cliente indisponível
          </button>
        )}
        <button
          type="button"
          disabled
          title="A abertura de relatórios técnicos não faz parte deste ecrã."
          className={SECONDARY_BUTTON}
        >
          Relatório Técnico indisponível
        </button>
      </div>
    </section>
  )
}
