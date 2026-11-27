import { CARD_CLASS } from '../../../shared/components/uiClasses'
import { formatTicketDateTime } from '../utils/labels'
import { getPoolReadingMetrics } from '../utils/ticketDetail'

const NUMBER_FORMAT = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 2 })

const STATE_STYLES = {
  normal: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  alert: 'border-red-200 bg-red-50 text-red-800',
  unknown: 'border-slate-200 bg-slate-50 text-slate-600',
}

const STATE_LABELS = {
  normal: 'Dentro dos limiares',
  alert: 'Fora dos limiares',
  unknown: 'Estado indisponível',
}

export default function PoolReadingsCard({ reading, thresholds }) {
  const metrics = getPoolReadingMetrics(reading, thresholds)

  return (
    <section className={`${CARD_CLASS} p-5`} aria-labelledby="pool-readings-title">
      <h2 id="pool-readings-title" className="font-semibold text-slate-800">
        Última leitura da piscina
      </h2>
      {reading ? (
        <>
          <p className="mt-1 text-xs text-slate-500">
            Registada em {formatTicketDateTime(reading.timestamp)}
          </p>
          <dl className="mt-4 grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
            {metrics.map((metric) => (
              <div
                key={metric.key}
                className={`rounded-lg border p-3 ${STATE_STYLES[metric.state]}`}
              >
                <dt className="text-xs font-medium">{metric.label}</dt>
                <dd className="mt-1 text-lg font-semibold">
                  {metric.value === null
                    ? '—'
                    : `${NUMBER_FORMAT.format(metric.value)}${metric.unit ? ` ${metric.unit}` : ''}`}
                </dd>
                <dd className="text-xs">{STATE_LABELS[metric.state]}</dd>
              </div>
            ))}
          </dl>
        </>
      ) : (
        <p className="mt-2 text-sm text-slate-500">Ainda não há leituras registadas para esta piscina.</p>
      )}
    </section>
  )
}
