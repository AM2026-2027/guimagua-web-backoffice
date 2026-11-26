const TIME_ZONE = 'Europe/Lisbon'

const ZONED_PARTS_FORMAT = new Intl.DateTimeFormat('en-GB', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
})

const LONG_DATE_FORMAT = new Intl.DateTimeFormat('pt-PT', {
  timeZone: TIME_ZONE,
  dateStyle: 'full',
})

const TIME_FORMAT = new Intl.DateTimeFormat('pt-PT', {
  timeZone: TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
})

function zonedParts(date) {
  return Object.fromEntries(
    ZONED_PARTS_FORMAT.formatToParts(date).map(({ type, value }) => [type, value]),
  )
}

function dateKeyParts(dateKey) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey)
  if (!match) throw new RangeError('Data inválida.')
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) }
}

function zonedDateTimeToDate(dateKey, hour = 0, minute = 0) {
  const { year, month, day } = dateKeyParts(dateKey)
  const targetAsUtc = Date.UTC(year, month - 1, day, hour, minute)
  let candidate = targetAsUtc

  // Converte uma hora de Lisboa para um instante UTC sem depender do fuso configurado no browser.
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const parts = zonedParts(new Date(candidate))
    const observedAsUtc = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
      Number(parts.second),
    )
    const adjustment = targetAsUtc - observedAsUtc
    if (adjustment === 0) return new Date(candidate)
    candidate += adjustment
  }

  return new Date(candidate)
}

export function toDate(value) {
  if (value == null) return null
  if (typeof value.toDate === 'function') return value.toDate()
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function dateKeyInLisbon(value = Date.now()) {
  const parts = zonedParts(new Date(value))
  return `${parts.year}-${parts.month}-${parts.day}`
}

export function shiftDateKey(dateKey, amount) {
  const { year, month, day } = dateKeyParts(dateKey)
  const shifted = new Date(Date.UTC(year, month - 1, day + amount))
  return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, '0')}-${String(shifted.getUTCDate()).padStart(2, '0')}`
}

export function getLisbonDayRange(dateKey) {
  return {
    start: zonedDateTimeToDate(dateKey),
    end: zonedDateTimeToDate(shiftDateKey(dateKey, 1)),
  }
}

export function formatLongDate(dateKey) {
  return LONG_DATE_FORMAT.format(zonedDateTimeToDate(dateKey, 12))
}

export function formatTime(value) {
  const date = toDate(value)
  return date ? TIME_FORMAT.format(date) : '—'
}

export function minutesInLisbon(value) {
  const date = toDate(value)
  if (!date) return null
  const parts = zonedParts(date)
  return Number(parts.hour) * 60 + Number(parts.minute)
}

export function dateKeyOf(value) {
  const date = toDate(value)
  return date ? dateKeyInLisbon(date.getTime()) : null
}
