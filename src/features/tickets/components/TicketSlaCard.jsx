import { CARD_CLASS } from '../../../shared/components/uiClasses'
import { getSlaStatus, slaLabel, SLA_TOTAL_HOURS } from '../utils/sla'

const SLA_STYLES = {
  critical: 'border-red-200 bg-red-50 text-red-800',
  attention: 'border-amber-200 bg-amber-50 text-amber-900',
  regular: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  unknown: 'border-slate-200 bg-slate-50 text-slate-700',
}

export default function TicketSlaCard({ createdAt, countdown, now }) {
  const status = now === null ? 'unknown' : getSlaStatus(createdAt, now)

  return (
    <section className={`${CARD_CLASS} p-4`} aria-label="Prazo de resposta">
      <div className={`rounded-xl border p-4 ${SLA_STYLES[status]}`}>
        <p className="text-xs font-semibold uppercase tracking-wide">SLA de resposta · {slaLabel(status)}</p>
        <p className="mt-1 text-2xl font-bold" aria-live="polite">
          {countdown}
        </p>
        <p className="mt-1 text-xs">Meta de resposta: {SLA_TOTAL_HOURS} horas desde a submissão.</p>
      </div>
    </section>
  )
}
