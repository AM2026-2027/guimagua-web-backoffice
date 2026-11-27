import { INPUT_CLASS, SECONDARY_BUTTON } from '../../../shared/components/uiClasses'
import { TICKET_CATEGORY_LABELS } from '../utils/labels'
import { SLA_FILTER_OPTIONS } from '../utils/sla'

const CATEGORY_FILTERS = [
  { value: 'all', label: 'Todos' },
  ...Object.entries(TICKET_CATEGORY_LABELS).map(([value, label]) => ({ value, label })),
]

export default function TicketsToolbar({
  searchTerm,
  onSearchChange,
  onSearchById,
  category,
  onCategoryChange,
  sla,
  onSlaChange,
  categoryCounts,
  slaCounts,
}) {
  function handleSubmit(event) {
    event.preventDefault()
    onSearchById()
  }

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4" aria-label="Pesquisa e filtros">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="ticket-search" className="sr-only">
          Pesquisar cliente, concelho ou referência do pedido
        </label>
        <input
          id="ticket-search"
          type="search"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Pesquisar cliente, concelho ou n.º do pedido"
          className={INPUT_CLASS}
        />
        <button type="submit" className={SECONDARY_BUTTON}>
          Procurar referência exata
        </button>
      </form>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-12 text-xs font-semibold uppercase tracking-wide text-slate-500">Tipo</span>
          {CATEGORY_FILTERS.map((filter) => {
            const count = filter.value === 'all' ? categoryCounts?.total : categoryCounts?.[filter.value]
            const active = category === filter.value
            return (
              <button
                key={filter.value}
                type="button"
                aria-pressed={active}
                onClick={() => onCategoryChange(filter.value)}
                className={`rounded-full border px-3 py-1 text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                  active ? 'border-primary bg-primary text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {filter.label} ({count ?? '—'})
              </button>
            )
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="w-12 text-xs font-semibold uppercase tracking-wide text-slate-500">SLA</span>
          {SLA_FILTER_OPTIONS.map((filter) => {
            const count = filter.value === 'all' ? slaCounts?.total : slaCounts?.[filter.value]
            const active = sla === filter.value
            return (
              <button
                key={filter.value}
                type="button"
                aria-pressed={active}
                onClick={() => onSlaChange(filter.value)}
                className={`rounded-full border px-3 py-1 text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                  active ? 'border-primary bg-primary text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {filter.label} ({count ?? '—'})
              </button>
            )
          })}
        </div>
      </div>
      <p className="text-xs text-slate-500">Fila ordenada por antiguidade: os pedidos mais antigos aparecem primeiro.</p>
    </section>
  )
}
