import { Link } from 'react-router'
import { CARD_CLASS } from '../../../shared/components/uiClasses'
import { formatDecimal, formatInteger } from '../utils/labels'

/**
 * Card lateral "Conformidade das Leituras": substitui a "Estabilidade da Frota 24h" do protótipo
 * por uma métrica 100% real calculada no cliente a partir das últimas `pool_readings` vs `settings/alert_thresholds`.
 */
export default function FleetStabilityCard({ fleetStability, activePoolsCount }) {
  const { total, optimalCount, alertCount, optimalPct, alertPct } = fleetStability
  const withoutReading = Number.isFinite(activePoolsCount) ? Math.max(0, activePoolsCount - total) : null

  return (
    <section aria-labelledby="stability-heading" className="space-y-4">
      <div className={`${CARD_CLASS} p-5`}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 id="stability-heading" className="text-base font-semibold text-slate-800">
              Conformidade das Leituras
            </h2>
            <p className="text-xs text-slate-500">Última leitura registada por piscina</p>
          </div>
          <span className="text-xl font-bold text-primary">{total > 0 ? `${formatDecimal(optimalPct, 1)}%` : '—'}</span>
        </div>

        <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
          {total > 0 && (
            <div className="flex h-full w-full">
              <div className="bg-primary transition-all" style={{ width: `${optimalPct}%` }} />
              <div className="bg-red-500 transition-all" style={{ width: `${alertPct}%` }} />
            </div>
          )}
        </div>

        <dl className="mt-4 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <dt className="flex items-center gap-2 text-slate-600">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" aria-hidden="true" />
              No intervalo ótimo
            </dt>
            <dd className="font-semibold text-slate-800">
              {formatInteger(optimalCount)} piscina{optimalCount === 1 ? '' : 's'} ({formatDecimal(optimalPct, 1)}%)
            </dd>
          </div>

          <div className="flex items-center justify-between">
            <dt className="flex items-center gap-2 text-slate-600">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" aria-hidden="true" />
              Em exceção paramétrica
            </dt>
            <dd className="font-semibold text-red-700">
              {formatInteger(alertCount)} piscina{alertCount === 1 ? '' : 's'} ({formatDecimal(alertPct, 1)}%)
            </dd>
          </div>

          {withoutReading !== null && (
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-2 text-slate-500">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300" aria-hidden="true" />
                Sem leitura recente
              </dt>
              <dd className="font-medium text-slate-600">{formatInteger(withoutReading)}</dd>
            </div>
          )}
        </dl>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-2xl bg-primary px-5 py-4 text-white">
        <div>
          <p className="text-sm font-semibold">Gestão de Relatórios</p>
          <p className="text-xs text-white/80">Consultar histórico técnico e PDFs</p>
        </div>
        <Link
          to="/reports"
          className="shrink-0 rounded-lg bg-white px-3.5 py-2 text-xs font-semibold text-primary hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          Abrir Relatórios
        </Link>
      </div>
    </section>
  )
}
