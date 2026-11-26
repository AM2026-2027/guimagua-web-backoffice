import { useMemo, useRef, useState } from 'react'
import { CARD_CLASS } from '../../../shared/components/uiClasses'
import { formatLongDate, dateKeyOf } from '../utils/date'
import { MONTH_WEEKDAY_LABELS } from '../utils/labels'
import { getMonthGridDays } from '../utils/month'
import { sortMonthAppointments } from '../utils/sort'
import MonthGridCell from './MonthGridCell'

const KEYBOARD_DAY_OFFSETS = {
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -7,
  ArrowDown: 7,
}

export default function MonthGrid({
  monthKey,
  appointments,
  staffById,
  servicesById,
  todayKey,
  onDaySelect,
}) {
  const days = useMemo(() => getMonthGridDays(monthKey), [monthKey])
  const [focusedDateKey, setFocusedDateKey] = useState(
    () => days.find((day) => day.inMonth)?.dateKey ?? days[0]?.dateKey,
  )
  const buttonRefs = useRef(new Map())

  const effectiveFocusedDateKey = days.some((day) => day.dateKey === focusedDateKey)
    ? focusedDateKey
    : days.find((day) => day.inMonth)?.dateKey ?? days[0]?.dateKey

  const appointmentsByDate = new Map()
  for (const appointment of sortMonthAppointments(appointments, staffById)) {
    const dateKey = dateKeyOf(appointment.date)
    if (!dateKey) continue
    const current = appointmentsByDate.get(dateKey) ?? []
    current.push(appointment)
    appointmentsByDate.set(dateKey, current)
  }

  function moveFocus(event, dateKey) {
    const offset = KEYBOARD_DAY_OFFSETS[event.key]
    if (!offset) return
    const nextDate = new Date(`${dateKey}T12:00:00.000Z`)
    nextDate.setUTCDate(nextDate.getUTCDate() + offset)
    const nextKey = nextDate.toISOString().slice(0, 10)
    const nextButton = buttonRefs.current.get(nextKey)
    if (!nextButton) return
    event.preventDefault()
    setFocusedDateKey(nextKey)
    nextButton.focus()
  }

  const rows = []
  for (let index = 0; index < days.length; index += 7) {
    rows.push(days.slice(index, index + 7))
  }

  return (
    <div className={`${CARD_CLASS} hidden overflow-x-auto p-3 md:block`}>
      <table role="grid" aria-label={`Agenda mensal ${monthKey}`} className="w-full table-fixed border-collapse">
        <thead>
          <tr role="row">
            {MONTH_WEEKDAY_LABELS.map((label) => (
              <th
                key={label}
                role="columnheader"
                scope="col"
                className="border border-slate-200 bg-slate-50 px-2 py-2 text-center text-xs font-semibold text-slate-600"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((week) => (
            <tr key={week[0].dateKey} role="row">
              {week.map((day) => {
                const dayAppointments = appointmentsByDate.get(day.dateKey) ?? []
                return (
                  <MonthGridCell
                    key={day.dateKey}
                    day={{ ...day, fullDateLabel: formatLongDate(day.dateKey) }}
                    appointments={dayAppointments}
                    staffById={staffById}
                    servicesById={servicesById}
                    todayKey={todayKey}
                    tabIndex={day.dateKey === effectiveFocusedDateKey ? 0 : -1}
                    buttonRef={(node) => {
                      if (node) buttonRefs.current.set(day.dateKey, node)
                      else buttonRefs.current.delete(day.dateKey)
                    }}
                    onSelect={onDaySelect}
                    onFocus={setFocusedDateKey}
                    onKeyDown={moveFocus}
                  />
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="sr-only">Use as setas do teclado para percorrer os dias. Enter abre a agenda diária.</p>
    </div>
  )
}
