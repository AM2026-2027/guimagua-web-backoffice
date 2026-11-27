// Datas do módulo de relatórios: sempre no fuso Europe/Lisbon e formato PT-PT.

const TIME_ZONE = 'Europe/Lisbon'
const DAY_MS = 24 * 60 * 60 * 1000

const OFFSET_PARTS = new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, timeZoneName: 'longOffset' })
const DATE_PARTS = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' })

/** Diferença (minutos) entre a hora de Lisboa e UTC num instante: 0 no inverno, 60 no verão. */
function lisbonOffsetMinutes(ms) {
  const name = OFFSET_PARTS.formatToParts(ms).find((part) => part.type === 'timeZoneName')?.value ?? 'GMT'
  const match = name.match(/GMT([+-])(\d{2}):(\d{2})/)
  if (!match) return 0
  const minutes = Number(match[2]) * 60 + Number(match[3])
  return match[1] === '-' ? -minutes : minutes
}

/** "2026-11-26" (valor de um <input type="date">) → meia-noite desse dia em Lisboa, em ms UTC. */
export function lisbonMidnightFromInput(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? '')
  if (!match) return null
  const utcMidnight = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return utcMidnight - lisbonOffsetMinutes(utcMidnight) * 60 * 1000
}

/** Data de hoje em Lisboa no formato de um <input type="date"> (chamar em handlers/efeitos, não na renderização). */
export function todayInput(nowMs) {
  const parts = Object.fromEntries(DATE_PARTS.formatToParts(nowMs).map((part) => [part.type, part.value]))
  return `${parts.year}-${parts.month}-${parts.day}`
}

/** Dia anterior/seguinte de um valor "AAAA-MM-DD" (usado nos atalhos de período e na navegação das rotas). */
export function shiftInputDate(value, days) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? '')
  if (!match) return value
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]) + days))
  return date.toISOString().slice(0, 10)
}

/**
 * Período [início, fim) em ms a partir de duas datas "AAAA-MM-DD" (ambas inclusivas).
 * O fim é a meia-noite do dia seguinte ao "até", para incluir o dia inteiro (também nos dias de mudança de hora).
 */
export function rangeFromInputs(from, to) {
  const startMs = from ? lisbonMidnightFromInput(from) : null
  const endMs = to ? lisbonMidnightFromInput(shiftInputDate(to, 1)) : null
  return { startMs, endMs }
}

/** Intervalo [início, fim) de um dia "AAAA-MM-DD" em Lisboa. */
export function dayRangeFromInput(day) {
  return rangeFromInputs(day, day)
}

export function toDate(value) {
  if (!value) return null
  if (typeof value.toDate === 'function') return value.toDate()
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const DATE_FORMAT = new Intl.DateTimeFormat('pt-PT', { timeZone: TIME_ZONE, dateStyle: 'medium' })
const DATE_TIME_FORMAT = new Intl.DateTimeFormat('pt-PT', { timeZone: TIME_ZONE, dateStyle: 'medium', timeStyle: 'short' })
const TIME_FORMAT = new Intl.DateTimeFormat('pt-PT', { timeZone: TIME_ZONE, timeStyle: 'short' })

export function formatDate(value) {
  const date = toDate(value)
  return date ? DATE_FORMAT.format(date) : '—'
}

export function formatDateTime(value) {
  const date = toDate(value)
  return date ? DATE_TIME_FORMAT.format(date) : '—'
}

export function formatTime(value) {
  const date = toDate(value)
  return date ? TIME_FORMAT.format(date) : '—'
}

/** Minutos entre a hora prevista e o check-in (positivo = atraso). null se faltar algum dos dois. */
export function checkinDelayMinutes(appointment) {
  const planned = toDate(appointment.date)
  const checkin = toDate(appointment.checkin_timestamp)
  if (!planned || !checkin) return null
  return Math.round((checkin.getTime() - planned.getTime()) / 60000)
}

export { DAY_MS }
