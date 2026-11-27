import { CARD_CLASS } from '../../../shared/components/uiClasses'
import { formatTicketDateTime } from '../utils/labels'

const STEPS = [
  { status: 'pending', label: 'Submissão' },
  { status: 'in_analysis', label: 'Triagem Técnica' },
  { status: 'responded', label: 'Respondido' },
]

export default function TicketProgress({ ticket }) {
  const currentIndex = STEPS.findIndex((step) => step.status === ticket.status)

  return (
    <section className={`${CARD_CLASS} p-4 sm:p-5`} aria-label="Progresso do pedido">
      <ol className="grid gap-3 sm:grid-cols-3">
        {STEPS.map((step, index) => {
          const complete = currentIndex >= 0 && index < currentIndex
          const current = index === currentIndex
          const date =
            step.status === 'pending'
              ? ticket.created_at
              : step.status === 'responded'
                ? ticket.responded_at
                : null
          const description = date
            ? formatTicketDateTime(date)
            : complete
              ? 'Concluído'
              : current
                ? 'Estado atual'
                : 'Por iniciar'

          return (
            <li
              key={step.status}
              aria-current={current ? 'step' : undefined}
              className={`flex min-w-0 items-start gap-3 rounded-xl border p-3 ${
                current
                  ? 'border-primary bg-primary/5'
                  : complete
                    ? 'border-emerald-200 bg-emerald-50'
                    : 'border-slate-200 bg-white'
              }`}
            >
              <span
                aria-hidden="true"
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                  current
                    ? 'bg-primary text-white'
                    : complete
                      ? 'bg-emerald-700 text-white'
                      : 'bg-slate-100 text-slate-500'
                }`}
              >
                {complete ? '✓' : index + 1}
              </span>
              <div className="min-w-0">
                <p className="font-medium text-slate-800">{step.label}</p>
                <p className="mt-1 text-xs text-slate-500">{description}</p>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
