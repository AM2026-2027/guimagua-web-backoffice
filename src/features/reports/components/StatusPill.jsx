import { APPOINTMENT_STATUS } from '../utils/labels'

export default function StatusPill({ status }) {
  const config = APPOINTMENT_STATUS[status] ?? { label: status ?? '—', className: 'bg-slate-100 text-slate-600 ring-slate-200' }
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${config.className}`}>
      <span aria-hidden="true">•</span>
      {config.label}
    </span>
  )
}
