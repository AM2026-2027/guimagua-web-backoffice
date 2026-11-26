import { INPUT_CLASS, SECONDARY_BUTTON } from '../../../shared/components/uiClasses'
import { MONTH_STATUS_OPTIONS } from '../utils/labels'
import { formatWeekLabel } from '../utils/week'

export default function WeekToolbar({
  weekKey,
  currentWeekKey,
  statusFilter,
  onStatusFilterChange,
  onWeekChange,
  visibleCount,
  countMessage,
}) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onWeekChange(-1)}
            aria-label="Semana anterior"
            className={SECONDARY_BUTTON}
          >
            ‹
          </button>
          <button type="button" onClick={() => onWeekChange(0)} className={SECONDARY_BUTTON}>
            Esta semana
          </button>
          <button
            type="button"
            onClick={() => onWeekChange(1)}
            aria-label="Semana seguinte"
            className={SECONDARY_BUTTON}
          >
            ›
          </button>
          <h2 className="min-w-60 text-base font-semibold capitalize text-slate-800">
            {formatWeekLabel(weekKey)}
          </h2>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {weekKey === currentWeekKey ? 'Semana atual · fuso Europe/Lisbon' : 'Fuso Europe/Lisbon'}
        </p>
      </div>

      <div className="sm:min-w-64">
        <label htmlFor="agenda-week-status" className="text-sm font-medium text-slate-700">
          Estado
        </label>
        <select
          id="agenda-week-status"
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

      <p className="text-sm text-slate-600" aria-live="polite">
        {visibleCount === null
          ? countMessage
          : `${visibleCount} ${visibleCount === 1 ? 'intervenção' : 'intervenções'}`}
      </p>
    </section>
  )
}
