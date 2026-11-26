import { INPUT_CLASS, SECONDARY_BUTTON } from '../../../shared/components/uiClasses'
import { formatLongDate } from '../utils/date'

export default function AgendaToolbar({
  dateKey,
  todayKey,
  status,
  statusOptions,
  searchTerm,
  onDateChange,
  onStatusChange,
  onSearchChange,
}) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 xl:flex-row xl:items-end xl:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onDateChange(-1)}
          aria-label="Dia anterior"
          className={SECONDARY_BUTTON}
        >
          ‹
        </button>
        <button type="button" onClick={() => onDateChange(0)} className={SECONDARY_BUTTON}>
          Hoje
        </button>
        <button
          type="button"
          onClick={() => onDateChange(1)}
          aria-label="Dia seguinte"
          className={SECONDARY_BUTTON}
        >
          ›
        </button>
        <div className="min-w-52">
          <p className="text-sm font-semibold capitalize text-slate-800">{formatLongDate(dateKey)}</p>
          <p className="text-xs text-slate-500">
            {dateKey === todayKey ? 'Hoje · fuso Europe/Lisbon' : 'Fuso Europe/Lisbon'}
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:min-w-[min(100%,36rem)]">
        <div>
          <label htmlFor="agenda-status" className="text-sm font-medium text-slate-700">
            Estado
          </label>
          <select
            id="agenda-status"
            value={status}
            onChange={(event) => onStatusChange(event.target.value)}
            className={INPUT_CLASS}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="agenda-search" className="text-sm font-medium text-slate-700">
            Pesquisar técnico, cliente ou morada
          </label>
          <input
            id="agenda-search"
            type="search"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Nome ou morada"
            className={INPUT_CLASS}
          />
        </div>
      </div>
    </section>
  )
}
