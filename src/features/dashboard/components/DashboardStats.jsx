import { Link } from 'react-router'
import { CARD_CLASS } from '../../../shared/components/uiClasses'
import { formatInteger } from '../utils/labels'

function KpiCard({ title, badge, badgeTone = 'info', value, subline, footerLeft, footerRight, to }) {
  const badgeClasses =
    badgeTone === 'danger'
      ? 'bg-red-50 text-red-700 ring-red-200'
      : badgeTone === 'warning'
        ? 'bg-amber-50 text-amber-800 ring-amber-200'
        : 'bg-sky-50 text-primary ring-sky-200'

  const content = (
    <div className={`${CARD_CLASS} flex h-full flex-col justify-between p-5 transition-colors hover:border-slate-300`}>
      <div>
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
          {badge && (
            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${badgeClasses}`}>
              {badge}
            </span>
          )}
        </div>
        <p className="mt-2 text-3xl font-bold text-slate-800">{value}</p>
        {subline && <p className="mt-1 text-xs text-slate-500">{subline}</p>}
      </div>

      {(footerLeft || footerRight) && (
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
          <span>{footerLeft}</span>
          <span className="font-medium text-primary">{footerRight}</span>
        </div>
      )}
    </div>
  )

  return to ? (
    <Link to={to} className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
      {content}
    </Link>
  ) : (
    content
  )
}

/**
 * 4 cartões de KPI do topo do Dashboard (RF-WEB05, spec #126 alinhada com o modelo oficial).
 */
export default function DashboardStats({
  dailySchedule,
  openTickets,
  openTicketsTotal,
  poolAlerts,
  lowStockCount,
  activeClientsCount,
}) {
  const { summary, rows } = dailySchedule
  const totalStaff = rows.length
  const busyStaff = rows.filter((row) => row.status === 'in_progress').length
  const availableStaff = rows.filter((row) => row.status === 'available').length
  const occupancyPct = totalStaff > 0 ? Math.round((busyStaff / totalStaff) * 100) : 0

  const urgentTickets = openTickets.filter((ticket) => ticket.priority === 'high').length
  const ticketsCount = Number.isFinite(openTicketsTotal) ? openTicketsTotal : openTickets.length

  const phDeviations = poolAlerts.filter((alert) => alert.evaluation.ph.outOfBounds).length
  const chlorineDeviations = poolAlerts.filter((alert) => alert.evaluation.chlorine.outOfBounds).length
  const tempDeviations = poolAlerts.filter((alert) => alert.evaluation.temperature.outOfBounds).length

  return (
    <section aria-label="Indicadores operacionais" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        title="Equipa no terreno"
        badge={`${occupancyPct}% em curso`}
        value={`${formatInteger(busyStaff)} / ${formatInteger(totalStaff)}`}
        subline={`${formatInteger(availableStaff)} colaborador${availableStaff === 1 ? '' : 'es'} sem tarefas pendentes hoje`}
        footerLeft={Number.isFinite(activeClientsCount) ? `${formatInteger(activeClientsCount)} clientes ativos` : 'Equipa ativa'}
        footerRight="Ver agenda →"
        to="/agenda"
      />

      <KpiCard
        title="Pedidos em fila"
        badge={urgentTickets > 0 ? `${formatInteger(urgentTickets)} urgentes` : 'Em triagem'}
        badgeTone={urgentTickets > 0 ? 'danger' : 'info'}
        value={formatInteger(ticketsCount)}
        subline="Pedidos pendentes ou em análise"
        footerLeft={`${formatInteger(openTickets.filter((item) => item.status === 'pending').length)} por analisar`}
        footerRight="Abrir triagem →"
        to="/tickets"
      />

      <KpiCard
        title="Alertas de leituras"
        badge={poolAlerts.length > 0 ? 'Exceções ativas' : 'Normal'}
        badgeTone={poolAlerts.length > 0 ? 'danger' : 'info'}
        value={formatInteger(poolAlerts.length)}
        subline={`Desvios: pH (${phDeviations}) · Cloro (${chlorineDeviations}) · Temp. (${tempDeviations})`}
        footerLeft={`${formatInteger(lowStockCount)} artigo${lowStockCount === 1 ? '' : 's'} em stock crítico`}
        footerRight="Ver inventário →"
        to="/inventory"
      />

      <KpiCard
        title="Intervenções hoje"
        badge={`${summary.completionPct}% concluído`}
        value={`${formatInteger(summary.completed)} / ${formatInteger(summary.total)}`}
        subline={`${formatInteger(summary.inProgress)} em execução · ${formatInteger(summary.scheduled)} agendadas`}
        footerLeft="Escala do dia"
        footerRight="Gerir escala →"
        to="/agenda"
      />
    </section>
  )
}
