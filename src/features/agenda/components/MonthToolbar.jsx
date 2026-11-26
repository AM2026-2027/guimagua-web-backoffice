import { INPUT_CLASS, SECONDARY_BUTTON } from '../../../shared/components/uiClasses'
import { MONTH_STATUS_OPTIONS } from '../utils/labels'
import { formatMonthLabel } from '../utils/month'

export default function MonthToolbar({
  monthKey,
  currentMonthKey,
  onMonthChange,
  statusFilter,
  onStatusFilterChange,
  specialtyFilter,
  specialtyOptions,
  onSpecialtyFilterChange,
  visibleCount,
  countMessage,
}) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onMonthChange(-1)}
            aria-label="Mês anterior"
            className={SECONDARY_BUTTON}
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => onMonthChange(0)}
            className={SECONDARY_BUTTON}
          >
            Este mês
          </button>
          <button
            type="button"
            onClick={() => onMonthChange(1)}
            aria-label="Mês seguinte"
            className={SECONDARY_BUTTON}
          >
            ›
          </button>
          <h2 className="min-w-40 text-base font-semibold capitalize text-slate-800">
            {formatMonthLabel(monthKey)}
          </h2>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {monthKey === currentMonthKey ? 'Mês atual · fuso Europe/Lisbon' : 'Fuso Europe/Lisbon'}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[min(100%,36rem)]">
        <div>
          <label htmlFor="agenda-month-status" className="text-sm font-medium text-slate-700">
            Estado
          </label>
          <select
            id="agenda-month-status"
            value={statusFilter}
            onChange={(event) => onStatusFilterChange(event.target.value)}
            className={INPUT_CLASS}
          >
            {MONTH_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="agenda-month-specialty" className="text-sm font-medium text-slate-700">
            Especialidade
          </label>
          <select
            id="agenda-month-specialty"
            value={specialtyFilter}
            onChange={(event) => onSpecialtyFilterChange(event.target.value)}
            className={INPUT_CLASS}
          >
            <option value="all">Todas as especialidades</option>
            {specialtyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-sm text-slate-600" aria-live="polite">
        {visibleCount === null
          ? countMessage
          : `${visibleCount} ${visibleCount === 1 ? 'intervenção' : 'intervenções'}`}
      </p>
    </section>
  )
}
