import { SAFETY_MARGIN_SERVICES, STOCK_LEVEL } from '../utils/stock'

/**
 * Card "Alertas de stock": nº de serviços com algum artigo a vermelho e nº com o pior artigo a amarelo.
 * Cada número é um atalho que filtra a lista por esses serviços (clicar de novo retira o filtro).
 */
export default function StockAlertsCard({ insufficientCount, marginCount, activeFilter, onFilter }) {
  const counters = [
    {
      level: STOCK_LEVEL.INSUFFICIENT,
      count: insufficientCount,
      dot: 'bg-red-600',
      text: 'text-red-700',
      label: 'Sem stock para 1 intervenção',
    },
    {
      level: STOCK_LEVEL.MARGIN,
      count: marginCount,
      dot: 'bg-yellow-400 ring-1 ring-yellow-600',
      text: 'text-amber-800',
      label: `Stock para ${SAFETY_MARGIN_SERVICES} intervenções ou menos`,
    },
  ]

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="pt-1 text-xs font-semibold uppercase tracking-wide text-slate-600">Alertas de stock</p>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-amber-100 text-amber-800" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="M12 4 3 20h18z" /><path d="M12 10v4M12 17h.01" />
          </svg>
        </span>
      </div>
      <div className="mt-1 grid grid-cols-2 gap-3">
        {counters.map((counter) => {
          const active = activeFilter === counter.level
          return (
            <button
              key={counter.level}
              type="button"
              onClick={() => onFilter(active ? 'all' : counter.level)}
              aria-pressed={active}
              title={active ? 'Retirar filtro' : 'Filtrar a lista por estes serviços'}
              className={`group rounded-md px-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${active ? 'bg-slate-100' : ''}`}
            >
              <span className={`flex items-center gap-2 text-2xl font-bold tracking-tight underline decoration-2 underline-offset-4 group-hover:decoration-4 ${counter.text}`}>
                <span className={`h-3 w-3 rounded-full ${counter.dot}`} aria-hidden="true" />
                {counter.count}
              </span>
              <span className="mt-1 block text-xs leading-snug text-slate-600">
                {counter.label}
                <span className="sr-only">{active ? ' (filtro ativo; clique para retirar)' : ' (clique para filtrar)'}</span>
              </span>
            </button>
          )
        })}
      </div>
    </article>
  )
}
