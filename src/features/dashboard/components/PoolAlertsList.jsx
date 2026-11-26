import { Link } from 'react-router'
import { CARD_CLASS, LINK_BUTTON, SECONDARY_BUTTON } from '../../../shared/components/uiClasses'
import {
  ALERT_FILTER_OPTIONS,
  formatDateTime,
  formatDecimal,
  formatRelativeAge,
  ticketPriorityLabel,
  ticketStatusLabel,
} from '../utils/labels'

function MetricBox({ label, value, target, status, outOfBounds }) {
  const valueClass = !outOfBounds
    ? 'text-slate-800'
    : status === 'low'
      ? 'text-amber-700'
      : 'text-red-700'
  const boxClass = outOfBounds ? 'border-red-200 bg-red-50/50' : 'border-slate-200 bg-slate-50/60'

  return (
    <div className={`rounded-xl border p-3 ${boxClass}`}>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className={`mt-1 text-lg font-bold ${valueClass}`}>{value}</dd>
      <p className="mt-0.5 text-[11px] text-slate-500">Alvo: {target}</p>
    </div>
  )
}

function WaterAlertCard({ alert }) {
  const { reading, evaluation, pool, client, severity } = alert
  const isCritical = severity === 'critical'
  const poolTitle = pool?.name || pool?.local_address || `Piscina ${reading.pool_id}`
  const subtitle = [client?.name, pool?.local_address].filter(Boolean).join(' · ')
  const { limits } = evaluation

  return (
    <article
      className={`${CARD_CLASS} overflow-hidden border-l-4 ${
        isCritical ? 'border-l-red-600' : 'border-l-amber-500'
      } p-5`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                isCritical ? 'bg-red-50 text-red-700 ring-1 ring-red-200' : 'bg-amber-50 text-amber-800 ring-1 ring-amber-200'
              }`}
            >
              {isCritical ? 'Crítico' : 'Atenção'} · {evaluation.deviations.join(', ')}
            </span>
            <h3 className="text-base font-semibold text-slate-800">{poolTitle}</h3>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {formatRelativeAge(reading.timestamp)} ({formatDateTime(reading.timestamp)})
            {subtitle ? ` · ${subtitle}` : ''}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {client?.id && (
            <Link to={`/clients?client=${client.id}`} className={SECONDARY_BUTTON}>
              Ver ficha
            </Link>
          )}
          <Link to="/agenda" className={LINK_BUTTON}>
            Agendar visita
          </Link>
        </div>
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricBox
          label="Cloro livre"
          value={Number.isFinite(reading.chlorine_ppm) ? `${formatDecimal(reading.chlorine_ppm, 2)} ppm` : '—'}
          target={`${formatDecimal(limits.chlorine_min_ppm, 1)}–${formatDecimal(limits.chlorine_max_ppm, 1)} ppm`}
          status={evaluation.chlorine.status}
          outOfBounds={evaluation.chlorine.outOfBounds}
        />
        <MetricBox
          label="pH da água"
          value={Number.isFinite(reading.ph_level) ? `${formatDecimal(reading.ph_level, 2)}` : '—'}
          target={`${formatDecimal(limits.ph_min, 1)}–${formatDecimal(limits.ph_max, 1)}`}
          status={evaluation.ph.status}
          outOfBounds={evaluation.ph.outOfBounds}
        />
        <MetricBox
          label="Temperatura"
          value={Number.isFinite(reading.temperature_c) ? `${formatDecimal(reading.temperature_c, 1)} °C` : '—'}
          target={`${formatDecimal(limits.temperature_min_c, 0)}–${formatDecimal(limits.temperature_max_c, 0)} °C`}
          status={evaluation.temperature.status}
          outOfBounds={evaluation.temperature.outOfBounds}
        />
        <MetricBox
          label="Salinidade"
          value={Number.isFinite(reading.salinity_gl) ? `${formatDecimal(reading.salinity_gl, 1)} g/L` : '—'}
          target="Leitura informativa"
          status="ok"
          outOfBounds={false}
        />
      </dl>
    </article>
  )
}

function StockAlertCard({ item }) {
  const unit = item.unit ? ` ${item.unit}` : ''
  return (
    <article
      className={`${CARD_CLASS} border-l-4 ${item.critical ? 'border-l-red-600' : 'border-l-amber-500'} p-5`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                item.critical
                  ? 'bg-red-50 text-red-700 ring-1 ring-red-200'
                  : 'bg-amber-50 text-amber-800 ring-1 ring-amber-200'
              }`}
            >
              {item.critical ? 'Rutura crítica' : 'Stock baixo'}
            </span>
            <h3 className="text-base font-semibold text-slate-800">{item.name}</h3>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Stock físico: <strong className="text-slate-700">{item.physical}{unit}</strong> · Stock projetado:{' '}
            <strong className="text-slate-700">{item.projected}{unit}</strong> · Mínimo definido:{' '}
            <strong className="text-slate-700">{item.min}{unit}</strong>
          </p>
        </div>

        <Link to="/inventory" className={SECONDARY_BUTTON}>
          Gerir inventário
        </Link>
      </div>
    </article>
  )
}

/**
 * Lista central de alertas (D-12: últimas `pool_readings` fora dos limiares + `consumables` em stock baixo)
 * e últimos pedidos em aberto (`tickets`) com atalho direto para triagem.
 */
export default function PoolAlertsList({
  poolAlerts,
  lowStockConsumables,
  openTickets,
  clientsById,
  poolsById,
  filter,
  onFilterChange,
}) {
  const criticalCount = poolAlerts.filter((item) => item.severity === 'critical').length
  const warningCount = poolAlerts.filter((item) => item.severity === 'warning').length
  const stockCount = lowStockConsumables.length
  const totalAlertsCount = poolAlerts.length + stockCount

  const countByFilter = {
    all: totalAlertsCount,
    critical: criticalCount,
    warning: warningCount,
    stock: stockCount,
  }

  const visibleWaterAlerts =
    filter === 'stock'
      ? []
      : filter === 'all'
        ? poolAlerts
        : poolAlerts.filter((item) => item.severity === filter)

  const visibleStockAlerts = filter === 'all' || filter === 'stock' ? lowStockConsumables : []

  return (
    <div className="space-y-6">
      <section aria-labelledby="alerts-heading" className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="alerts-heading" className="text-lg font-semibold text-slate-800">
              Alertas das Piscinas & Stock
            </h2>
            <p className="text-xs text-slate-500">
              Exceções na última leitura face a <code className="text-slate-600">settings/alert_thresholds</code> e
              consumíveis abaixo do mínimo.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar alertas">
            {ALERT_FILTER_OPTIONS.map((option) => {
              const active = filter === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onFilterChange(option.value)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                    active
                      ? 'bg-primary text-white'
                      : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {option.label} ({countByFilter[option.value]})
                </button>
              )
            })}
          </div>
        </div>

        {visibleWaterAlerts.length === 0 && visibleStockAlerts.length === 0 ? (
          <div className={`${CARD_CLASS} p-6 text-center text-sm text-slate-500`}>
            Sem alertas ativos para este filtro. Todas as leituras avaliadas e níveis de stock encontram-se conformes.
          </div>
        ) : (
          <div className="space-y-3">
            {visibleWaterAlerts.map((alert) => (
              <WaterAlertCard key={alert.id} alert={alert} />
            ))}
            {visibleStockAlerts.map((item) => (
              <StockAlertCard key={`stock-${item.id}`} item={item} />
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="recent-tickets-heading" className={`${CARD_CLASS} p-5`}>
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 id="recent-tickets-heading" className="text-base font-semibold text-slate-800">
              Últimos Pedidos Recebidos
            </h2>
            <p className="text-xs text-slate-500">Pedidos pendentes ou em análise submetidos pela App Cliente.</p>
          </div>
          <Link to="/tickets" className={LINK_BUTTON}>
            Ver todos →
          </Link>
        </div>

        {openTickets.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">Não existem pedidos pendentes ou em análise.</p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100">
            {openTickets.slice(0, 5).map((ticket) => {
              const client = ticket.client_id ? clientsById.get(ticket.client_id) : null
              const pool = ticket.pool_id ? poolsById.get(ticket.pool_id) : null
              const urgent = ticket.priority === 'high'
              return (
                <li key={ticket.id} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          ticket.status === 'pending'
                            ? 'bg-amber-50 text-amber-800 ring-1 ring-amber-200'
                            : 'bg-sky-50 text-primary ring-1 ring-sky-200'
                        }`}
                      >
                        {ticketStatusLabel(ticket.status)}
                      </span>
                      {urgent && (
                        <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700 ring-1 ring-red-200">
                          {ticketPriorityLabel(ticket.priority)}
                        </span>
                      )}
                      <span className="truncate text-sm font-medium text-slate-800">
                        {client?.name || 'Cliente'}
                        {pool?.name || pool?.local_address ? ` · ${pool.name || pool.local_address}` : ''}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs text-slate-500">{ticket.description || 'Sem descrição.'}</p>
                  </div>

                  <div className="flex shrink-0 items-center gap-3 text-xs text-slate-400">
                    <span>{formatRelativeAge(ticket.created_at)}</span>
                    <Link to="/tickets" className={LINK_BUTTON}>
                      Triagem
                    </Link>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
