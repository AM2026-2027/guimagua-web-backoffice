import { useMemo, useRef, useState } from 'react'
import { CARD_CLASS } from '../../../shared/components/uiClasses'
import { dateKeyOf, formatLongDate } from '../utils/date'
import { staffRoleLabel } from '../utils/labels'
import { sortAgendaAppointments } from '../utils/sort'
import { getWeekDays } from '../utils/week'
import WeekGridCell from './WeekGridCell'

function getCellKey(dateKey, personId) {
  return `${dateKey}:${personId}`
}

export default function WeekGrid({
  weekKey,
  appointments,
  staff,
  staffById,
  servicesById,
  todayKey,
  onDaySelect,
}) {
  const days = useMemo(
    () => getWeekDays(weekKey).map((day) => ({ ...day, fullDateLabel: formatLongDate(day.dateKey) })),
    [weekKey],
  )
  const staffRows = useMemo(() => {
    const assignedStaffIds = new Set(appointments.map((appointment) => appointment.tech_id).filter(Boolean))
    const availableStaff = staff
      .filter((person) => person.is_active !== false || assignedStaffIds.has(person.id))
      .toSorted((left, right) => left.name.localeCompare(right.name, 'pt-PT'))
    const hasUnknownStaff = appointments.some(
      (appointment) => !appointment.tech_id || !staffById[appointment.tech_id],
    )
    return hasUnknownStaff
      ? [...availableStaff, { id: '__unidentified__', name: 'Colaborador não identificado', role: null }]
      : availableStaff
  }, [appointments, staff, staffById])

  const appointmentsByCell = useMemo(() => {
    const byCell = new Map()
    for (const appointment of sortAgendaAppointments(appointments, staffById)) {
      const staffId = staffById[appointment.tech_id] ? appointment.tech_id : '__unidentified__'
      const dateKey = dateKeyOf(appointment.date)
      if (!dateKey || !days.some((day) => day.dateKey === dateKey)) continue
      const key = getCellKey(dateKey, staffId)
      byCell.set(key, [...(byCell.get(key) ?? []), appointment])
    }
    return byCell
  }, [appointments, days, staffById])

  const [focusedCellKey, setFocusedCellKey] = useState(() =>
    staffRows.length && days.length ? getCellKey(days[0].dateKey, staffRows[0].id) : '',
  )
  const cellRefs = useRef(new Map())

  const effectiveFocusedCellKey = staffRows.some((person) =>
    days.some((day) => getCellKey(day.dateKey, person.id) === focusedCellKey),
  )
    ? focusedCellKey
    : staffRows.length && days.length
      ? getCellKey(days[0].dateKey, staffRows[0].id)
      : ''

  function moveFocus(event, dateKey, personId) {
    const dayIndex = days.findIndex((day) => day.dateKey === dateKey)
    const rowIndex = staffRows.findIndex((person) => person.id === personId)
    let nextDayIndex = dayIndex
    let nextRowIndex = rowIndex

    switch (event.key) {
      case 'ArrowLeft':
        nextDayIndex -= 1
        if (nextDayIndex < 0 && nextRowIndex > 0) {
          nextRowIndex -= 1
          nextDayIndex = days.length - 1
        }
        break
      case 'ArrowRight':
        nextDayIndex += 1
        if (nextDayIndex >= days.length && nextRowIndex < staffRows.length - 1) {
          nextRowIndex += 1
          nextDayIndex = 0
        }
        break
      case 'ArrowUp':
        nextRowIndex -= 1
        break
      case 'ArrowDown':
        nextRowIndex += 1
        break
      case 'Home':
        nextDayIndex = 0
        break
      case 'End':
        nextDayIndex = days.length - 1
        break
      case 'Enter':
      case ' ':
        if (event.target === event.currentTarget) {
          event.preventDefault()
          onDaySelect(dateKey)
        }
        return
      default:
        return
    }

    const nextDay = days[nextDayIndex]
    const nextPerson = staffRows[nextRowIndex]
    if (!nextDay || !nextPerson) return
    const nextKey = getCellKey(nextDay.dateKey, nextPerson.id)
    const nextCell = cellRefs.current.get(nextKey)
    if (!nextCell) return
    event.preventDefault()
    setFocusedCellKey(nextKey)
    nextCell.focus()
  }

  return (
    <div className={`${CARD_CLASS} hidden overflow-x-auto p-3 md:block`}>
      <table
        role="grid"
        aria-label={`Agenda semanal ${weekKey}`}
        aria-rowcount={staffRows.length + (staffRows.length === 0 ? 2 : 1)}
        aria-colcount={days.length + 1}
        className="w-full min-w-[1100px] table-fixed border-collapse"
      >
        <thead>
          <tr role="row">
            <th
              role="columnheader"
              scope="col"
              className="w-44 border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs font-semibold text-slate-600"
            >
              Técnico / comercial
            </th>
            {days.map((day) => (
              <th
                key={day.dateKey}
                role="columnheader"
                scope="col"
                className="border border-slate-200 bg-slate-50 px-1 py-2 text-center"
              >
                <button
                  type="button"
                  onClick={() => onDaySelect(day.dateKey)}
                  aria-label={`${day.fullDateLabel}. Abrir agenda do dia.`}
                  aria-current={day.dateKey === todayKey ? 'date' : undefined}
                  className={`rounded px-1 py-1 text-xs font-semibold capitalize focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    day.dateKey === todayKey ? 'text-primary' : 'text-slate-600'
                  }`}
                >
                  {day.weekdayLabel}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {staffRows.length === 0 ? (
            <tr role="row">
              <td colSpan={days.length + 1} className="p-6 text-center text-sm text-slate-500">
                Não há técnicos ou comerciais disponíveis para apresentar.
              </td>
            </tr>
          ) : (
            staffRows.map((person) => (
              <tr key={person.id} role="row">
                <th
                  role="rowheader"
                  scope="row"
                  className="border border-slate-200 bg-slate-50 px-3 py-2 text-left align-top"
                >
                  <span className="block text-sm font-medium text-slate-800">{person.name}</span>
                  {person.role && (
                    <span className="text-xs text-slate-500">{staffRoleLabel(person.role)}</span>
                  )}
                  {!person.role && <span className="text-xs text-slate-500">Sem associação</span>}
                </th>
                {days.map((day) => {
                  const key = getCellKey(day.dateKey, person.id)
                  return (
                    <WeekGridCell
                      key={key}
                      day={day}
                      person={person}
                      appointments={appointmentsByCell.get(key) ?? []}
                      servicesById={servicesById}
                      tabIndex={key === effectiveFocusedCellKey ? 0 : -1}
                      cellRef={(node) => {
                        if (node) cellRefs.current.set(key, node)
                        else cellRefs.current.delete(key)
                      }}
                      onFocus={() => setFocusedCellKey(key)}
                      onKeyDown={moveFocus}
                      onDaySelect={onDaySelect}
                    />
                  )
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
      <p className="sr-only">
        Use as setas para percorrer a grelha. Enter ou Espaço abre a agenda diária da célula.
      </p>
    </div>
  )
}
