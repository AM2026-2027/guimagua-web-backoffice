// Categorias propostas para tickets; validar com a equipa Android antes do PR.
export const TICKET_CATEGORY_LABELS = {
  quote: 'Orçamento',
  breakdown: 'Assistência técnica',
  maintenance: 'Manutenção',
}

export const TICKET_STATUS_LABELS = {
  pending: 'Pendente de triagem',
  in_analysis: 'Em triagem',
  responded: 'Respondido',
}

export const TICKET_PRIORITY_LABELS = {
  low: 'Baixa',
  normal: 'Normal',
  high: 'Alta',
}

export const SLA_LABELS = {
  critical: 'Crítico',
  attention: 'Atenção',
  regular: 'Regular',
  unknown: 'Sem data',
}

export function ticketCategoryLabel(value) {
  return TICKET_CATEGORY_LABELS[value] ?? value ?? '—'
}

export function ticketStatusLabel(value) {
  return TICKET_STATUS_LABELS[value] ?? value ?? '—'
}

export function ticketPriorityLabel(value) {
  return TICKET_PRIORITY_LABELS[value] ?? value ?? '—'
}

export function toDate(value) {
  if (!value) return null
  if (typeof value.toDate === 'function') return value.toDate()
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const DATE_TIME_FORMAT = new Intl.DateTimeFormat('pt-PT', {
  timeZone: 'Europe/Lisbon',
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function formatTicketDateTime(value) {
  const date = toDate(value)
  return date ? DATE_TIME_FORMAT.format(date) : '—'
}
