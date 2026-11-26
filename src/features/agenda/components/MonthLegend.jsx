import { CARD_CLASS } from '../../../shared/components/uiClasses'
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_ORDER } from '../utils/labels'
import { appointmentStatusClass } from '../utils/status'

const STATUS_MARKS = {
  scheduled: '○',
  in_progress: '▶',
  completed: '✓',
  cancelled: '×',
}

export default function MonthLegend() {
  return (
    <section className={`${CARD_CLASS} p-3`} aria-label="Legenda dos estados">
      <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-700">
        {APPOINTMENT_STATUS_ORDER.map((status) => (
          <li key={status} className="inline-flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className={`inline-flex h-5 min-w-5 items-center justify-center rounded border px-1 ${appointmentStatusClass(status)}`}
            >
              {STATUS_MARKS[status]}
            </span>
            {APPOINTMENT_STATUS_LABELS[status]}
          </li>
        ))}
      </ul>
    </section>
  )
}
