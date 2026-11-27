import { Link } from 'react-router'
import { CARD_CLASS, SECONDARY_BUTTON } from '../../../shared/components/uiClasses'
import { formatLisbonDateTime, formatRelativeAge } from '../utils/labels'
import { formatPtNumber } from '../utils/thresholds'

const FILTER_OPTIONS = [
  { value: 'alerts', label: 'Fora de limiar' },
  { value: 'all', label: 'Todas' },
  { value: 'ok', label: 'Conformes' },
]

function ReadingMetric({ label, value, unit, deviation }) {
  const isOut = Boolean(deviation)
  const toneClass = !isOut
    ? 'border-slate-200 bg-slate-50/70 text-slate-800'
    : deviation.severity === 'critical'
      ? 'border-red-200 bg-red-50 text-red-800'
      : 'border-amber-200 bg-amber-50 text-amber-800'

  return (
    <div className={`rounded-lg border px-3 py-2 ${toneClass}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide">{label}</span>
        {isOut && (
          <span className="text-[10px] font-bold uppercase">
            {deviation.direction === 'low' ? 'Baixo' : 'Alto'}
          </span>
        )}
      </div>
      <p className="mt-1 text-base font-bold">
        {value === null || value === undefined ? '—' : `${formatPtNumber(value, 1)}${unit ? ` ${unit}` : ''}`}
      </p>
      {isOut && (
        <p className="mt-0.5 text-[11px]">
          Alvo: {formatPtNumber(deviation.min, 1)}–{formatPtNumber(deviation.max, 1)}
          {unit ? ` ${unit}` : ''}
        </p>
      )}
    </div>
  )
}

export default function PoolAlertsCard({
  poolStatuses,
  thresholds,
  filter,
  onFilterChange,
  onOpenThresholds,
}) {
  const alertCount = poolStatuses.filter((entry) => entry.deviations.length > 0).length
  const okCount = poolStatuses.length - alertCount

  const visibleEntries = poolStatuses.filter((entry) => {
    if (filter === 'alerts') return entry.deviations.length > 0
    if (filter === 'ok') return entry.deviations.length === 0
    return true
  })

  return (
    <section className={`${CARD_CLASS} p-5 shadow-xs`} aria-labelledby="pool-alerts-heading">
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 id="pool-alerts-heading" className="text-base font-semibold text-slate-800">
              Alertas das Piscinas
            </h2>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                alertCount > 0 ? 'bg-red-50 text-red-700 ring-1 ring-red-200' : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
              }`}
            >
              {alertCount} {alertCount === 1 ? 'alerta ativo' : 'alertas ativos'}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Última leitura registada por piscina comparada com os limiares configurados ({poolStatuses.length}{' '}
            monitorizada{poolStatuses.length === 1 ? '' : 's'}, {okCount} conforme{okCount === 1 ? '' : 's'}).
          </p>
        </div>

        <button type="button" onClick={onOpenThresholds} className={`${SECONDARY_BUTTON} shrink-0 text-xs`}>
          Configurar limiares
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
        <span>
          <strong>Limiares ativos:</strong> pH {formatPtNumber(thresholds.ph_min)}–{formatPtNumber(thresholds.ph_max)} ·
          Cloro {formatPtNumber(thresholds.chlorine_min_ppm)}–{formatPtNumber(thresholds.chlorine_max_ppm)} ppm · Temp.{' '}
          {formatPtNumber(thresholds.temperature_min_c, 0)}–{formatPtNumber(thresholds.temperature_max_c, 0)} °C
        </span>
        <div role="group" aria-label="Filtrar leituras das piscinas" className="flex flex-wrap gap-1">
          {FILTER_OPTIONS.map((option) => {
            const active = filter === option.value
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => onFilterChange(option.value)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                  active ? 'bg-primary text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100'
                }`}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>

      {poolStatuses.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-sm text-slate-500">
          Ainda não existem leituras físico-químicas registadas na coleção <code className="text-xs">pool_readings</code>.
        </div>
      ) : visibleEntries.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-emerald-200 bg-emerald-50/40 p-6 text-center text-sm text-emerald-800">
          Todas as piscinas monitorizadas encontram-se dentro dos limiares configurados.
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {visibleEntries.map(({ reading, pool, client, deviations }) => {
            const hasCritical = deviations.some((item) => item.severity === 'critical')
            const hasDeviation = deviations.length > 0
            const deviationByKey = Object.fromEntries(deviations.map((item) => [item.key, item]))

            return (
              <li
                key={reading.id}
                className={`rounded-xl border p-4 ${
                  hasCritical
                    ? 'border-red-200 bg-red-50/30'
                    : hasDeviation
                      ? 'border-amber-200 bg-amber-50/30'
                      : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          hasCritical
                            ? 'bg-red-100 text-red-800'
                            : hasDeviation
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {hasCritical ? 'Crítico' : hasDeviation ? 'Atenção' : 'Conforme'}
                      </span>
                      <h3 className="text-sm font-semibold text-slate-800">
                        {pool?.name || pool?.local_address || `Piscina ${reading.pool_id}`}
                      </h3>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {client?.name ? `${client.name} · ` : ''}
                      {pool?.local_address && pool?.name ? `${pool.local_address} · ` : ''}
                      Leitura {formatRelativeAge(reading.timestamp)} ({formatLisbonDateTime(reading.timestamp)})
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={client?.id ? `/clients?client=${client.id}` : '/clients'}
                      className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                      Ver ficha
                    </Link>
                    {hasDeviation && (
                      <Link
                        to="/agenda"
                        className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-white hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                      >
                        Agendar visita
                      </Link>
                    )}
                  </div>
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  <ReadingMetric label="pH" value={reading.ph_level} unit="" deviation={deviationByKey.ph_level} />
                  <ReadingMetric
                    label="Cloro livre"
                    value={reading.chlorine_ppm}
                    unit="ppm"
                    deviation={deviationByKey.chlorine_ppm}
                  />
                  <ReadingMetric
                    label="Temperatura"
                    value={reading.temperature_c}
                    unit="°C"
                    deviation={deviationByKey.temperature_c}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
