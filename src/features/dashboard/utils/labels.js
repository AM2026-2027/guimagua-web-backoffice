// Mapas de rótulos PT-PT para valores guardados em minúsculas snake_case (D-07) e formatação Europe/Lisbon.

export const APPOINTMENT_STATUS_LABELS = {
  scheduled: 'Agendado',
  in_progress: 'Em execução',
  completed: 'Concluído',
  cancelled: 'Cancelado',
}

export const TICKET_STATUS_LABELS = {
  pending: 'Pendente',
  in_analysis: 'Em análise',
  responded: 'Respondido',
}

export const TICKET_PRIORITY_LABELS = {
  low: 'Baixa',
  normal: 'Normal',
  high: 'Urgente',
}

export const STAFF_ROLE_LABELS = {
  technician: 'Técnico',
  commercial: 'Comercial',
}

export const ALERT_FILTER_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'critical', label: 'Críticos' },
  { value: 'warning', label: 'Atenção' },
  { value: 'stock', label: 'Stock crítico' },
]

export function appointmentStatusLabel(value) {
  return APPOINTMENT_STATUS_LABELS[value] ?? value ?? '—'
}

export function ticketStatusLabel(value) {
  return TICKET_STATUS_LABELS[value] ?? value ?? '—'
}

export function ticketPriorityLabel(value) {
  return TICKET_PRIORITY_LABELS[value] ?? value ?? 'Normal'
}

export function staffRoleLabel(value) {
  return STAFF_ROLE_LABELS[value] ?? value ?? 'Colaborador'
}

const TIME_ZONE = 'Europe/Lisbon'

const DATE_LONG_FORMAT = new Intl.DateTimeFormat('pt-PT', {
  timeZone: TIME_ZONE,
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

const TIME_FORMAT = new Intl.DateTimeFormat('pt-PT', {
  timeZone: TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
})

const DATE_TIME_FORMAT = new Intl.DateTimeFormat('pt-PT', {
  timeZone: TIME_ZONE,
  dateStyle: 'short',
  timeStyle: 'short',
})

const LISBON_PARTS_FORMAT = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})

/** Aceita Timestamp do Firestore, Date ou milissegundos. */
export function toDate(value) {
  if (!value) return null
  if (typeof value.toDate === 'function') return value.toDate()
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatDateLong(value) {
  const date = toDate(value)
  return date ? DATE_LONG_FORMAT.format(date) : '—'
}

export function formatTime(value) {
  const date = toDate(value)
  return date ? TIME_FORMAT.format(date) : '—'
}

export function formatDateTime(value) {
  const date = toDate(value)
  return date ? DATE_TIME_FORMAT.format(date) : '—'
}

export function formatRelativeAge(value, nowMs = Date.now()) {
  const date = toDate(value)
  if (!date) return '—'
  const diffMin = Math.max(0, Math.round((nowMs - date.getTime()) / 60000))
  if (diffMin < 1) return 'Agora mesmo'
  if (diffMin < 60) return `Há ${diffMin} min`
  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) {
    const restMin = diffMin % 60
    return restMin > 0 ? `Há ${diffHours} h ${restMin} min` : `Há ${diffHours} h`
  }
  const diffDays = Math.floor(diffHours / 24)
  return diffDays === 1 ? 'Há 1 dia' : `Há ${diffDays} dias`
}

const NUMBER_FORMATTERS = new Map()

export function formatDecimal(value, decimals = 1) {
  if (!Number.isFinite(value)) return '—'
  let formatter = NUMBER_FORMATTERS.get(decimals)
  if (!formatter) {
    formatter = new Intl.NumberFormat('pt-PT', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
    NUMBER_FORMATTERS.set(decimals, formatter)
  }
  return formatter.format(value)
}

export function formatInteger(value) {
  if (!Number.isFinite(value)) return '—'
  return new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 }).format(value)
}

export function initialsOf(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  const first = parts[0][0]
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return `${first}${last}`.toUpperCase()
}

function zonedMidnightUtc(year, month, day) {
  // Estima a meia-noite UTC e ajusta pelo desfasamento real de Europe/Lisbon nessa data (WET/WEST).
  const guessUtc = Date.UTC(year, month - 1, day, 0, 0, 0)
  const parts = Object.fromEntries(
    LISBON_PARTS_FORMAT.formatToParts(new Date(guessUtc))
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, Number(part.value)]),
  )
  const lisbonAsUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour % 24, parts.minute, parts.second)
  const offsetMs = lisbonAsUtc - guessUtc
  return new Date(guessUtc - offsetMs)
}

/**
 * Calcula o início (00:00:00) e o fim exclusivo (00:00:00 do dia seguinte) do dia civil
 * no fuso horário `Europe/Lisbon`, independentemente do fuso do navegador.
 */
export function getLisbonDayBounds(referenceDate = new Date()) {
  const parts = Object.fromEntries(
    LISBON_PARTS_FORMAT.formatToParts(referenceDate)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, Number(part.value)]),
  )
  const dayKey = `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`
  const dayStart = zonedMidnightUtc(parts.year, parts.month, parts.day)
  const nextDayUtc = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + 1))
  const dayEnd = zonedMidnightUtc(
    nextDayUtc.getUTCFullYear(),
    nextDayUtc.getUTCMonth() + 1,
    nextDayUtc.getUTCDate(),
  )
  return { dayKey, dayStart, dayEnd }
}
