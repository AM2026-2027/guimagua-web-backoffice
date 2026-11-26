import { getLisbonDayRange } from './date'

const MONTH_LABEL_FORMAT = new Intl.DateTimeFormat('pt-PT', {
  timeZone: 'Europe/Lisbon',
  month: 'long',
  year: 'numeric',
})

function monthParts(monthKey) {
  if (!/^\d{4}-\d{2}$/.test(monthKey)) throw new RangeError('Mês inválido.')
  const year = Number(monthKey.slice(0, 4))
  const month = Number(monthKey.slice(5, 7))
  if (month < 1 || month > 12) throw new RangeError('Mês inválido.')
  return { year, month }
}

function dateKeyFromUtcDate(date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`
}

export function shiftMonthKey(monthKey, amount) {
  const { year, month } = monthParts(monthKey)
  const shifted = new Date(Date.UTC(year, month - 1 + amount, 1))
  return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, '0')}`
}

export function getLisbonMonthRange(monthKey) {
  monthParts(monthKey)
  const startDateKey = `${monthKey}-01`
  const endDateKey = `${shiftMonthKey(monthKey, 1)}-01`
  return {
    start: getLisbonDayRange(startDateKey).start,
    end: getLisbonDayRange(endDateKey).start,
  }
}

export function getMonthGridDays(monthKey) {
  const { year, month } = monthParts(monthKey)
  const firstDay = new Date(Date.UTC(year, month - 1, 1))
  const lastDayNumber = new Date(Date.UTC(year, month, 0)).getUTCDate()
  const firstOffset = (firstDay.getUTCDay() + 6) % 7
  const gridStart = new Date(Date.UTC(year, month - 1, 1 - firstOffset))
  const gridDayCount = Math.ceil((firstOffset + lastDayNumber) / 7) * 7

  return Array.from({ length: gridDayCount }, (_, index) => {
    const date = new Date(gridStart)
    date.setUTCDate(gridStart.getUTCDate() + index)
    const dateKey = dateKeyFromUtcDate(date)
    return {
      dateKey,
      dayNumber: date.getUTCDate(),
      inMonth: date.getUTCMonth() === month - 1 && date.getUTCFullYear() === year,
    }
  })
}

export function formatMonthLabel(monthKey) {
  const { year, month } = monthParts(monthKey)
  return MONTH_LABEL_FORMAT.format(new Date(Date.UTC(year, month - 1, 15, 12)))
}
