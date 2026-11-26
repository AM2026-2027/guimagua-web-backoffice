import { formatLongDate, getLisbonDayRange, shiftDateKey } from './date'
import { getWeekStartDateKey, isValidWeekKey } from './viewParams'

const WEEKDAY_LABEL_FORMAT = new Intl.DateTimeFormat('pt-PT', {
  timeZone: 'Europe/Lisbon',
  weekday: 'short',
  day: 'numeric',
  month: 'short',
})

export function getLisbonWeekRange(weekKey) {
  if (!isValidWeekKey(weekKey)) throw new RangeError('A semana tem de começar à segunda-feira.')
  return {
    start: getLisbonDayRange(weekKey).start,
    end: getLisbonDayRange(shiftDateKey(weekKey, 7)).start,
  }
}

export function getWeekDays(weekKey) {
  if (!isValidWeekKey(weekKey)) throw new RangeError('A semana tem de começar à segunda-feira.')
  return Array.from({ length: 7 }, (_, index) => {
    const dateKey = shiftDateKey(weekKey, index)
    return {
      dateKey,
      weekdayLabel: WEEKDAY_LABEL_FORMAT.format(new Date(`${dateKey}T12:00:00.000Z`)),
    }
  })
}

export function shiftWeekKey(weekKey, amount) {
  if (!isValidWeekKey(weekKey)) throw new RangeError('A semana tem de começar à segunda-feira.')
  return getWeekStartDateKey(shiftDateKey(weekKey, amount * 7))
}

export function formatWeekLabel(weekKey) {
  return `${formatLongDate(weekKey)} – ${formatLongDate(shiftDateKey(weekKey, 6))}`
}
