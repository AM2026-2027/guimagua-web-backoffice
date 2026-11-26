export function isValidDateKey(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const parsed = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}

export function isValidMonthKey(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}$/.test(value)) return false
  const month = Number(value.slice(5, 7))
  return month >= 1 && month <= 12
}

export function getWeekStartDateKey(dateKey) {
  if (!isValidDateKey(dateKey)) throw new RangeError('Data inválida.')
  const date = new Date(`${dateKey}T12:00:00.000Z`)
  const daysSinceMonday = (date.getUTCDay() + 6) % 7
  date.setUTCDate(date.getUTCDate() - daysSinceMonday)
  return date.toISOString().slice(0, 10)
}

export function isValidWeekKey(value) {
  return isValidDateKey(value) && getWeekStartDateKey(value) === value
}

export function parseAgendaViewParams(searchParams, todayKey) {
  const requestedView = searchParams.get('view')
  const view = requestedView === 'month' ? 'month' : 'day'
  const requestedDate = searchParams.get('date')
  const requestedMonth = searchParams.get('month')
  const dateKey = isValidDateKey(requestedDate) ? requestedDate : todayKey
  const monthKey = isValidMonthKey(requestedMonth) ? requestedMonth : todayKey.slice(0, 7)
  const normalizedParams = new URLSearchParams(searchParams)

  normalizedParams.set('view', view)
  if (view === 'day') {
    normalizedParams.set('date', dateKey)
    normalizedParams.delete('month')
    normalizedParams.delete('week')
  } else {
    normalizedParams.set('month', monthKey)
    normalizedParams.delete('date')
    normalizedParams.delete('week')
  }

  return {
    view,
    dateKey,
    monthKey,
    normalizedSearch: normalizedParams.toString(),
  }
}

export function createDaySearchParams(dateKey) {
  return new URLSearchParams({ view: 'day', date: dateKey })
}

export function createMonthSearchParams(monthKey) {
  return new URLSearchParams({ view: 'month', month: monthKey })
}

export function createWeekSearchParams(dateKey) {
  return new URLSearchParams({
    view: 'week',
    week: getWeekStartDateKey(dateKey),
  })
}
