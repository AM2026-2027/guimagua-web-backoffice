import { CARD_CLASS } from '../../../shared/components/uiClasses'
import { formatTicketAge, SLA_CRITICAL_REMAINING_HOURS, SLA_TOTAL_HOURS } from '../utils/sla'

function formatCount(value) {
  return Number.isFinite(value) ? new Intl.NumberFormat('pt-PT').format(value) : '—'
}

function StatCard({ label, value, hint }) {
  return (
    <article className={`${CARD_CLASS} min-w-0 p-4`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-primary">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </article>
  )
}

export default function TicketsStats({ stats, oldest }) {
  const assistanceCount =
    stats?.categories?.breakdown != null && stats?.categories?.maintenance != null
      ? stats.categories.breakdown + stats.categories.maintenance
      : null

  return (
    <section className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4" aria-label="Indicadores da fila">
      <StatCard
        label="Mais antigo na fila"
        value={oldest ? formatTicketAge(oldest.created_at) : '—'}
        hint={oldest ? `Ref. ${oldest.id}` : 'Sem pedidos pendentes'}
      />
      <StatCard
        label="Orçamentos pendentes"
        value={formatCount(stats?.categories?.quote)}
        hint="Pedidos abertos da categoria orçamento"
      />
      <StatCard
        label="Assistência e manutenção"
        value={formatCount(assistanceCount)}
        hint="Pedidos abertos, sem integração IoT"
      />
      <StatCard
        label="Pedidos críticos"
        value={formatCount(stats?.sla?.critical)}
        hint={`Pedidos abertos com SLA de ${SLA_TOTAL_HOURS} h e até ${SLA_CRITICAL_REMAINING_HOURS} h restantes ou prazo vencido`}
      />
    </section>
  )
}
