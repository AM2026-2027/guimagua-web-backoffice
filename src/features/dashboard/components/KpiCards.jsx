import { Link } from 'react-router'
import { CARD_CLASS } from '../../../shared/components/uiClasses'

function KpiCard({ label, value, badge, footnote, linkTo, linkLabel, accentClass }) {
  return (
    <article className={`${CARD_CLASS} flex flex-col justify-between p-4 shadow-xs`}>
      <div>
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          {badge && (
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${accentClass}`}>
              {badge}
            </span>
          )}
        </div>
        <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
        <p className="mt-1 text-xs text-slate-600">{footnote}</p>
      </div>
      <div className="mt-3 border-t border-slate-100 pt-2.5">
        <Link
          to={linkTo}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          {linkLabel}
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  )
}

export default function KpiCards({
  openTicketsCount,
  todayAppointments,
  activeClientsCount,
  criticalConsumables,
  totalActiveConsumables,
}) {
  const completedToday = todayAppointments.filter((item) => item.status === 'completed').length
  const inProgressToday = todayAppointments.filter((item) => item.status === 'in_progress').length
  const physicalLowCount = criticalConsumables.filter(
    (item) => Number(item.stock_quantity) <= Number(item.min_stock),
  ).length

  return (
    <section aria-label="Indicadores operacionais" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        label="Pedidos em aberto"
        value={openTicketsCount}
        badge={openTicketsCount > 0 ? 'Triagem' : 'Em dia'}
        accentClass={openTicketsCount > 0 ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-700'}
        footnote="Pedidos pendentes ou em análise submetidos pelos clientes"
        linkTo="/tickets"
        linkLabel="Ver pedidos"
      />
      <KpiCard
        label="Intervenções hoje"
        value={todayAppointments.length}
        badge={inProgressToday > 0 ? `${inProgressToday} em curso` : 'Hoje'}
        accentClass="bg-sky-50 text-primary"
        footnote={`${completedToday} concluída${completedToday === 1 ? '' : 's'} no dia de hoje`}
        linkTo="/agenda"
        linkLabel="Abrir agenda"
      />
      <KpiCard
        label="Clientes ativos"
        value={activeClientsCount}
        badge="Carteira"
        accentClass="bg-blue-50 text-primary"
        footnote="Proprietários com ficha ativa no sistema"
        linkTo="/clients"
        linkLabel="Gerir clientes"
      />
      <KpiCard
        label="Stock crítico"
        value={criticalConsumables.length}
        badge={criticalConsumables.length > 0 ? 'Atenção' : 'Estável'}
        accentClass={criticalConsumables.length > 0 ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}
        footnote={`${physicalLowCount} abaixo do mínimo físico (em ${totalActiveConsumables} artigos)`}
        linkTo="/inventory"
        linkLabel="Ver inventário"
      />
    </section>
  )
}
