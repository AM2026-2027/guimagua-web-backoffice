import { Link } from 'react-router'
import { CARD_CLASS } from '../../../shared/components/uiClasses'
import { formatPtNumber } from '../utils/thresholds'

export default function LowStockCard({ criticalConsumables }) {
  const visibleItems = criticalConsumables.slice(0, 6)

  return (
    <section className={`${CARD_CLASS} p-5 shadow-xs`} aria-labelledby="low-stock-heading">
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h2 id="low-stock-heading" className="text-base font-semibold text-slate-800">
            Alertas de Stock Crítico
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">Artigos com stock físico ou projetado igual ou inferior ao mínimo</p>
        </div>
        <Link
          to="/inventory"
          className="shrink-0 text-xs font-semibold text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          Gerir stock →
        </Link>
      </div>

      {criticalConsumables.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-emerald-200 bg-emerald-50/40 p-5 text-center text-sm text-emerald-800">
          Nenhum artigo abaixo do stock mínimo configurado.
        </div>
      ) : (
        <>
          <ul className="mt-4 divide-y divide-slate-100">
            {visibleItems.map((item) => {
              const physical = Number(item.stock_quantity)
              const projected = item.projected_stock !== null && item.projected_stock !== undefined
                ? Number(item.projected_stock)
                : null
              const minStock = Number(item.min_stock)
              const physicalLow = Number.isFinite(physical) && physical <= minStock
              const unit = item.unit ? ` ${item.unit}` : ''

              return (
                <li key={item.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">{item.name}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Físico: <strong>{formatPtNumber(physical, 1)}{unit}</strong>
                      {projected !== null && (
                        <>
                          {' '}· Projetado: <strong>{formatPtNumber(projected, 1)}{unit}</strong>
                        </>
                      )}
                      {' '}· Mínimo: {formatPtNumber(minStock, 1)}{unit}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      physicalLow
                        ? 'bg-red-50 text-red-700 ring-1 ring-red-200'
                        : 'bg-amber-50 text-amber-800 ring-1 ring-amber-200'
                    }`}
                  >
                    {physicalLow ? 'Rutura física' : 'Rutura projetada'}
                  </span>
                </li>
              )
            })}
          </ul>
          {criticalConsumables.length > visibleItems.length && (
            <p className="mt-3 border-t border-slate-100 pt-2.5 text-xs text-slate-500">
              A mostrar {visibleItems.length} de {criticalConsumables.length} artigos em alerta.{' '}
              <Link to="/inventory" className="font-semibold text-primary hover:underline">
                Ver todos no inventário
              </Link>
              .
            </p>
          )}
        </>
      )}
    </section>
  )
}
