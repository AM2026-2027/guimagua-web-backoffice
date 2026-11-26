import { CARD_CLASS } from '../../../shared/components/uiClasses'

function StatCard({ label, value, hint }) {
  return (
    <div className={`${CARD_CLASS} p-5`}>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-800">{value ?? '—'}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  )
}

/** Totais calculados a partir da lista já carregada e da atividade de hoje (sem leituras extra). */
export default function TeamStats({ activeTechnicians, activeCommercials, inService, visitsToday }) {
  return (
    <section aria-label="Totais da equipa" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Técnicos ativos" value={activeTechnicians} />
      <StatCard label="Comerciais ativos" value={activeCommercials} />
      <StatCard label="Em serviço agora" value={inService} hint="Com uma intervenção em curso" />
      <StatCard label="Visitas agendadas hoje" value={visitsToday} hint="Sem contar as canceladas" />
    </section>
  )
}
