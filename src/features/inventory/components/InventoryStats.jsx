import { CARD_CLASS } from '../../../shared/components/uiClasses'

function StatCard({ label, value, hint, tone = 'text-slate-800' }) {
  return (
    <div className={`${CARD_CLASS} p-5`}>
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-semibold ${tone}`}>{value ?? '—'}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  )
}

/** Cartão que funciona como filtro da tabela (clicar ativa; voltar a clicar limpa). */
function FilterCard({ label, value, hint, tone = 'text-slate-800', active, onClick }) {
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
      <span className={`mt-2 block text-3xl font-semibold ${tone}`}>{value ?? '—'}</span>
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </button>
  )
}

/**
 * Totais do inventário. O total de ativos vem de uma contagem no servidor; os restantes são calculados
 * sobre os artigos já carregados (o Firestore não compara dois campos numa query).
 * Os cartões "comprometidos" e "alertas" filtram a tabela (`activeFilter`: null | 'committed' | 'alerts').
 */
export default function InventoryStats({ activeCount, inStock, committedItems, appointmentsCount, alerts, partial, activeFilter, onToggleFilter }) {
  const loadedHint = partial ? 'Nos artigos carregados' : undefined
  return (
    <section aria-label="Totais do inventário" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Artigos ativos em catálogo" value={activeCount} />
      <StatCard label="Artigos em stock conforme" value={inStock} hint={loadedHint} />
      <FilterCard
        label="Artigos comprometidos com visitas"
        value={committedItems}
        hint={appointmentsCount === null ? undefined : `Em ${appointmentsCount} agendamento${appointmentsCount === 1 ? '' : 's'} por realizar`}
        active={activeFilter === 'committed'}
        onClick={() => onToggleFilter('committed')}
      />
      <FilterCard
        label="Alertas: stock baixo ou sem stock"
        value={alerts}
        hint={loadedHint}
        tone={alerts > 0 ? 'text-amber-600' : 'text-slate-800'}
        active={activeFilter === 'alerts'}
        onClick={() => onToggleFilter('alerts')}
      />
    </section>
  )
}
