import { SLA_LABELS, toDate } from './labels'

const HOUR_MS = 60 * 60 * 1000

export const SLA_TOTAL_HOURS = 24
export const SLA_CRITICAL_REMAINING_HOURS = 6
export const SLA_ATTENTION_REMAINING_HOURS = 18

export function getSlaCutoffs(now = Date.now()) {
  const hour = 60 * 60 * 1000
  return {
    criticalBefore: now - (SLA_TOTAL_HOURS - SLA_CRITICAL_REMAINING_HOURS) * hour,
    attentionBefore: now - (SLA_TOTAL_HOURS - SLA_ATTENTION_REMAINING_HOURS) * hour,
  }
}

export const SLA_FILTER_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'critical', label: `Crítico (≤${SLA_CRITICAL_REMAINING_HOURS} h)` },
  {
    value: 'attention',
    label: `Atenção (${SLA_CRITICAL_REMAINING_HOURS}–${SLA_ATTENTION_REMAINING_HOURS} h)`,
  },
  { value: 'regular', label: `Regular (>${SLA_ATTENTION_REMAINING_HOURS} h)` },
]

export function getSlaStatus(createdAt, now = Date.now()) {
  const created = toDate(createdAt)
  if (!created) return 'unknown'

  const remainingHours = (created.getTime() + SLA_TOTAL_HOURS * HOUR_MS - now) / HOUR_MS
  if (remainingHours <= SLA_CRITICAL_REMAINING_HOURS) return 'critical'
  if (remainingHours <= SLA_ATTENTION_REMAINING_HOURS) return 'attention'
  return 'regular'
}

export function getSlaRemaining(createdAt, now = Date.now()) {
  const created = toDate(createdAt)
  return created ? created.getTime() + SLA_TOTAL_HOURS * HOUR_MS - now : null
}

export function formatSlaCountdown(remainingMs) {
  if (!Number.isFinite(remainingMs)) return 'Prazo indisponível'
  if (remainingMs <= 0) return 'Prazo ultrapassado'

  const totalMinutes = Math.ceil(remainingMs / (60 * 1000))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours} h ${minutes.toString().padStart(2, '0')} min`
}

export function formatTicketAge(createdAt, now = Date.now()) {
  const created = toDate(createdAt)
  if (!created) return 'Data indisponível'

  const elapsedMinutes = Math.max(0, Math.floor((now - created.getTime()) / (60 * 1000)))
  const days = Math.floor(elapsedMinutes / (60 * 24))
  const hours = Math.floor((elapsedMinutes % (60 * 24)) / 60)
  const minutes = elapsedMinutes % 60

  if (days > 0) return `${days} d ${hours} h atrás`
  if (hours > 0) return `${hours} h ${minutes} min atrás`
  return `${minutes} min atrás`
}

export function slaLabel(status) {
  return SLA_LABELS[status] ?? SLA_LABELS.unknown
}

export function averageResponseMinutes(tickets) {
  const durations = tickets
    .map((ticket) => {
      const created = toDate(ticket.created_at)?.getTime()
      const responded = toDate(ticket.responded_at)?.getTime()
      return Number.isFinite(created) && Number.isFinite(responded) && responded >= created
        ? (responded - created) / (60 * 1000)
        : null
    })
    .filter((duration) => duration !== null)

  if (durations.length === 0) return null
  return durations.reduce((total, duration) => total + duration, 0) / durations.length
}

export function formatDurationMinutes(minutes) {
  if (!Number.isFinite(minutes)) return '—'
  const roundedMinutes = Math.round(minutes)
  const hours = Math.floor(roundedMinutes / 60)
  const remainder = roundedMinutes % 60
  if (hours === 0) return `${remainder} min`
  return remainder === 0 ? `${hours} h` : `${hours} h ${remainder} min`
}
