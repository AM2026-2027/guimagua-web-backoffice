export default function StatusBadge({ active, activeLabel = 'Ativo', inactiveLabel = 'Inativo' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
        active ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
      }`}
    >
      <span aria-hidden="true">•</span>
      {active ? activeLabel : inactiveLabel}
    </span>
  )
}
