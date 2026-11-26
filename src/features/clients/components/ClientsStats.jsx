import { CARD_CLASS } from '../../../shared/components/uiClasses'

const NUMBER_FORMAT = new Intl.NumberFormat('pt-PT')

function formatCount(value) {
  return value == null ? '—' : NUMBER_FORMAT.format(value)
}

function StatCard({ label, value, hint }) {
  return (
    <div className={`${CARD_CLASS} p-5`}>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-800">{formatCount(value)}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  )
}

/** Cartão que funciona como filtro da lista (clicar ativa; voltar a clicar limpa). */
function FilterCard({ label, value, hint, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-2xl border bg-white p-5 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
        active ? 'border-primary ring-2 ring-primary/30' : 'border-slate-200 hover:border-primary/40 hover:bg-slate-50'
      }`}
    >
      <span className="flex items-start justify-between gap-2">
        <span className="text-sm text-slate-500">{label}</span>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${active ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'}`}>
          {active ? 'Filtro ativo' : 'Filtrar'}
        </span>
      </span>
      <span className="mt-2 block text-3xl font-semibold text-slate-800">{formatCount(value)}</span>
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </button>
  )
}

/**
 * Totais de clientes e piscinas. Os cartões de clientes ativos e inativos filtram a lista
 * (substituem o antigo filtro "Estado"); `status`: 'all' | 'active' | 'inactive'.
 * Alertas e manutenções ficam no dashboard (D-12).
 */
export default function ClientsStats({ counts, status, onStatusChange }) {
  const toggle = (value) => onStatusChange(status === value ? 'all' : value)
  return (
    <section aria-label="Totais" className="grid gap-4 sm:grid-cols-3">
      <FilterCard label="Clientes ativos" value={counts?.clients} active={status === 'active'} onClick={() => toggle('active')} />
      <FilterCard
        label="Clientes inativos"
        value={counts?.inactiveClients}
        hint="Desativados; podem ser reativados"
        active={status === 'inactive'}
        onClick={() => toggle('inactive')}
      />
      <StatCard label="Piscinas ativas" value={counts?.pools} hint="Associadas a clientes" />
    </section>
  )
}
