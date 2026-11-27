const TIME_ZONE = 'Europe/Lisbon'

const DATE_FORMAT = new Intl.DateTimeFormat('pt-PT', {
  timeZone: TIME_ZONE,
  dateStyle: 'medium',
})

const DATE_TIME_FORMAT = new Intl.DateTimeFormat('pt-PT', {
  timeZone: TIME_ZONE,
  dateStyle: 'medium',
  timeStyle: 'short',
})

function getDateParts(date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  return Object.fromEntries(parts.filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]))
}

function dateInputValue(date) {
  const parts = getDateParts(date)
  return `${parts.year}-${parts.month}-${parts.day}`
}

function addCalendarDays(value, days) {
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day + days))
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`
}

function lisbonMidnight(value) {
  const [year, month, day] = value.split('-').map(Number)
  const utcGuess = Date.UTC(year, month - 1, day)
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(utcGuess))
  const values = Object.fromEntries(parts.filter((part) => part.type !== 'literal').map((part) => [part.type, Number(part.value)]))
  const representedAsUtc = Date.UTC(values.year, values.month - 1, values.day, values.hour, values.minute, values.second)
  return new Date(utcGuess - (representedAsUtc - utcGuess))
}

export function getDefaultReportPeriod(now = new Date()) {
  const endDate = dateInputValue(now)
  return { startDate: addCalendarDays(endDate, -29), endDate }
}

export function isValidReportPeriod(period) {
  return Boolean(period.startDate && period.endDate && period.startDate <= period.endDate)
}

export function toFirestorePeriod(period) {
  if (!isValidReportPeriod(period)) {
    throw new Error('O período selecionado não é válido.')
  }
  return {
    start: lisbonMidnight(period.startDate),
    endExclusive: lisbonMidnight(addCalendarDays(period.endDate, 1)),
  }
}

export function formatReportDateTime(value) {
  if (!value) return '—'
  const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : DATE_TIME_FORMAT.format(date)
}

export function formatReportDate(value) {
  if (!value) return '—'
  const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : DATE_FORMAT.format(date)
}
