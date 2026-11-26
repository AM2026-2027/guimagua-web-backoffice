import { useRef } from 'react'
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
  weekKey,
  onWeekNavigate,
}) {
  const dayActive = view === 'day'
  const weekActive = view === 'week'
  const monthActive = view === 'month'
  const tabs = useRef([])

  function moveFocus(event, currentIndex) {
    const offsets = { ArrowRight: 1, ArrowLeft: -1, Home: -currentIndex, End: 2 - currentIndex }
    if (!Object.prototype.hasOwnProperty.call(offsets, event.key)) return
    event.preventDefault()
    const nextIndex = (currentIndex + offsets[event.key] + 3) % 3
    tabs.current[nextIndex]?.focus()
  }

  return (
    <nav
      role="tablist"
      aria-label="Vistas da agenda"
      aria-orientation="horizontal"
      className={`${CARD_CLASS} inline-flex items-center gap-1 p-1`}
    >
      <Link
        id="agenda-tab-day"
        ref={(element) => {
          tabs.current[0] = element
        }}
        to={agendaUrl(createDaySearchParams(dayDateKey))}
        role="tab"
        aria-selected={dayActive}
        aria-controls="agenda-view-panel"
        tabIndex={dayActive ? 0 : -1}
        onKeyDown={(event) => moveFocus(event, 0)}
        className={`rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
          dayActive ? 'bg-primary text-white' : 'text-slate-700 hover:bg-background'
        }`}
      >
        Dia
      </Link>
      <Link
        id="agenda-tab-week"
        ref={(element) => {
          tabs.current[1] = element
        }}
        to={agendaUrl(createWeekSearchParams(weekKey))}
        onClick={onWeekNavigate}
        role="tab"
        aria-selected={weekActive}
        aria-controls="agenda-view-panel"
        tabIndex={weekActive ? 0 : -1}
        onKeyDown={(event) => moveFocus(event, 1)}
        className={`rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
          weekActive ? 'bg-primary text-white' : 'text-slate-700 hover:bg-background'
        }`}
      >
        Semana
      </Link>
      <Link
        id="agenda-tab-month"
        ref={(element) => {
          tabs.current[2] = element
        }}
        to={agendaUrl(createMonthSearchParams(monthKey))}
        role="tab"
        aria-selected={monthActive}
        aria-controls="agenda-view-panel"
        tabIndex={monthActive ? 0 : -1}
        onKeyDown={(event) => moveFocus(event, 2)}
        className={`rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
          monthActive ? 'bg-primary text-white' : 'text-slate-700 hover:bg-background'
        }`}
      >
        Mês
      </Link>
    </nav>
  )
}
