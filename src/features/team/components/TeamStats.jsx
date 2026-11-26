/** Cartão que funciona como filtro da tabela (clicar ativa; voltar a clicar limpa). */
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
      <span className="mt-2 block text-3xl font-semibold text-slate-800">{value ?? '—'}</span>
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </button>
  )
}

/**
 * Totais calculados a partir da lista já carregada e da atividade de hoje (sem leituras extra).
 * Cada cartão filtra a tabela; `activeFilter` é uma chave de TEAM_CARD_FILTERS ou null.
 */
export default function TeamStats({ activeTechnicians, activeCommercials, inService, withVisitsToday, visitsToday, inactive, activeFilter, onToggleFilter }) {
  const card = (key, label, value, hint) => (
    <FilterCard key={key} label={label} value={value} hint={hint} active={activeFilter === key} onClick={() => onToggleFilter(key)} />
  )
  return (
    <section aria-label="Totais da equipa" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {card('technicians', 'Técnicos ativos', activeTechnicians)}
      {card('commercials', 'Comerciais ativos', activeCommercials)}
      {card('in_service', 'Em serviço agora', inService, 'Com uma intervenção em curso')}
      {card('visits_today', 'Visitas agendadas hoje', visitsToday, withVisitsToday == null ? undefined : `${withVisitsToday} colaborador${withVisitsToday === 1 ? '' : 'es'} com visitas`)}
      {card('inactive', 'Contas inativas', inactive, 'Sem acesso às apps')}
    </section>
  )
}
