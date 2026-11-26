import { Link } from 'react-router'
import { CARD_CLASS } from '../../../shared/components/uiClasses'
import {
  createDaySearchParams,
  createMonthSearchParams,
  createWeekSearchParams,
} from '../utils/viewParams'

function agendaUrl(params) {
  return `/agenda?${params.toString()}`
}

export default function AgendaViewTabs({
  view,
  dayDateKey,
  monthKey,
  onDayNavigate,
  onMonthNavigate,
}) {
  const dayActive = view === 'day'
  const monthActive = view === 'month'
  const weekAnchorDateKey = dayActive ? dayDateKey : `${monthKey}-01`
  const weekUrl = agendaUrl(createWeekSearchParams(weekAnchorDateKey))

  return (
    <nav className={`${CARD_CLASS} inline-flex items-center gap-1 p-1`} aria-label="Vistas da agenda">
      <Link
        to={agendaUrl(createDaySearchParams(dayDateKey))}
        onClick={() => onDayNavigate(dayDateKey)}
        aria-current={dayActive ? 'page' : undefined}
        className={`rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
          dayActive ? 'bg-primary text-white' : 'text-slate-700 hover:bg-background'
        }`}
      >
        Dia
      </Link>
      <button
        type="button"
        disabled
        data-week-url={weekUrl}
        aria-label="Vista semanal, em breve"
        className="rounded-lg px-3 py-2 text-sm text-slate-400 disabled:cursor-not-allowed disabled:opacity-70"
      >
        Semana <span className="text-xs">(em breve)</span>
      </button>
      <Link
        to={agendaUrl(createMonthSearchParams(monthKey))}
        onClick={onMonthNavigate}
        aria-current={monthActive ? 'page' : undefined}
        className={`rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
          monthActive ? 'bg-primary text-white' : 'text-slate-700 hover:bg-background'
        }`}
      >
        Mês
      </Link>
    </nav>
  )
}
