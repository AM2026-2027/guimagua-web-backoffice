import { CARD_CLASS } from '../../../shared/components/uiClasses'

const NUMBER_FORMAT = new Intl.NumberFormat('pt-PT')

function StatCard({ label, value, hint }) {
  return (
    <div className={`${CARD_CLASS} p-5`}>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-800">{value == null ? '—' : NUMBER_FORMAT.format(value)}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  )
}

/** Totais de clientes e piscinas ativos. Alertas e manutenções ficam no dashboard (D-12). */
export default function ClientsStats({ counts }) {
  return (
    <section aria-label="Totais" className="grid gap-4 sm:grid-cols-2">
      <StatCard label="Clientes ativos" value={counts?.clients} />
      <StatCard label="Piscinas ativas" value={counts?.pools} hint="Associadas a clientes" />
    </section>
  )
}
