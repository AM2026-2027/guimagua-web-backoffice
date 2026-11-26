/**
 * Card "Estado do catálogo": nº de serviços ativos e inativos. Cada número filtra a lista por esse estado
 * (clicar de novo retira o filtro). Substitui o antigo filtro "Estado" da barra de filtros.
 */
export default function ServiceStatusCard({ activeCount, inactiveCount, catalogShare, activeFilter, onFilter }) {
  const counters = [
    { status: 'active', count: activeCount, text: 'text-slate-900', label: catalogShare === null ? 'Serviços ativos' : `Ativos (${catalogShare}% do catálogo)` },
    { status: 'inactive', count: inactiveCount, text: 'text-slate-500', label: 'Inativos (ocultos nos agendamentos)' },
  ]

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="pt-1 text-xs font-semibold uppercase tracking-wide text-slate-600">Estado do catálogo</p>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-sky-100 text-primary" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <circle cx="12" cy="12" r="8" /><path d="m9 12 2 2 4-4" />
          </svg>
        </span>
      </div>
      <div className="mt-1 grid grid-cols-2 gap-3">
        {counters.map((counter) => {
          const active = activeFilter === counter.status
          return (
            <button
              key={counter.status}
              type="button"
              onClick={() => onFilter(active ? 'all' : counter.status)}
              aria-pressed={active}
              title={active ? 'Retirar filtro' : 'Filtrar a lista por estes serviços'}
              className={`group rounded-md px-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${active ? 'bg-slate-100' : ''}`}
            >
              <span className={`block text-2xl font-bold tracking-tight underline decoration-2 underline-offset-4 group-hover:decoration-4 ${counter.text}`}>
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
