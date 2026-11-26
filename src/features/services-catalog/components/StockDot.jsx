import { SAFETY_MARGIN_SERVICES, STOCK_LEVEL, STOCK_LEVEL_LABELS } from '../utils/stock'

const DOT_COLORS = {
  [STOCK_LEVEL.SURPLUS]: 'bg-green-600',
  [STOCK_LEVEL.MARGIN]: 'bg-yellow-400 ring-1 ring-yellow-600',
  [STOCK_LEVEL.INSUFFICIENT]: 'bg-red-600',
  [STOCK_LEVEL.UNKNOWN]: 'bg-slate-300',
}

/**
 * Bola de semáforo do stock. A cor não é a única pista: o rótulo vai no `title`
 * (rato) e em texto só para leitores de ecrã.
 */
export default function StockDot({ level }) {
  const label = STOCK_LEVEL_LABELS[level] ?? STOCK_LEVEL_LABELS[STOCK_LEVEL.UNKNOWN]
  return (
    <span className="inline-flex shrink-0 items-center" title={label}>
      <span className={`h-2.5 w-2.5 rounded-full ${DOT_COLORS[level] ?? DOT_COLORS[STOCK_LEVEL.UNKNOWN]}`} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  )
}

export function StockLegend() {
  const items = [
    [STOCK_LEVEL.SURPLUS, 'Stock de sobra'],
    [STOCK_LEVEL.MARGIN, `Margem mínima (até ${SAFETY_MARGIN_SERVICES} intervenções)`],
    [STOCK_LEVEL.INSUFFICIENT, 'Insuficiente para 1 intervenção'],
  ]
  return (
    <p className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-200 px-4 py-2 text-xs text-slate-600">
      <span className="font-semibold">Stock dos produtos obrigatórios:</span>
      {items.map(([level, label]) => (
        <span key={level} className="inline-flex items-center gap-1.5">
          <span className={`h-2.5 w-2.5 rounded-full ${DOT_COLORS[level]}`} aria-hidden="true" />
          {label}
        </span>
      ))}
    </p>
  )
}
