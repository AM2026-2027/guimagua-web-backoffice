const LISBON_TIMEZONE = 'Europe/Lisbon'

export const TICKET_STATUS_LABELS = {
  pending: 'Pendente',
  in_analysis: 'Em análise',
  responded: 'Respondido',
}

export const TICKET_STATUS_CLASSES = {
  pending: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200',
  in_analysis: 'bg-sky-50 text-sky-800 ring-1 ring-sky-200',
  responded: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
}

export const TICKET_PRIORITY_LABELS = {
  low: 'Baixa',
  normal: 'Normal',
  high: 'Alta',
}

export const TICKET_PRIORITY_CLASSES = {
  low: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
  normal: 'bg-blue-50 text-primary ring-1 ring-blue-200',
  high: 'bg-red-50 text-red-700 ring-1 ring-red-200',
}

export const TICKET_CATEGORY_LABELS = {
  breakdown: 'Avaria',
  quote: 'Orçamento',
  maintenance: 'Manutenção',
}

export const APPOINTMENT_STATUS_LABELS = {
  scheduled: 'Agendado',
  in_progress: 'Em curso',
  completed: 'Concluído',
  cancelled: 'Cancelado',
}

export const APPOINTMENT_STATUS_CLASSES = {
  scheduled: 'bg-sky-50 text-sky-800 ring-1 ring-sky-200',
  in_progress: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200',
  completed: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  cancelled: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
}

export function getEnumLabel(map, value, fallback = '—') {
  if (typeof value !== 'string' || !value.trim()) return fallback
  const normalized = value.trim().toLowerCase()
  return map[normalized] ?? value
}

export function getEnumClass(map, value, fallback = 'bg-slate-100 text-slate-600 ring-1 ring-slate-200') {
  if (typeof value !== 'string' || !value.trim()) return fallback
  return map[value.trim().toLowerCase()] ?? fallback
}

export function toDate(value) {
  if (!value) return null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value
  if (typeof value.toDate === 'function') {
    const converted = value.toDate()
    return Number.isNaN(converted.getTime()) ? null : converted
  }
  if (typeof value === 'object' && typeof value.seconds === 'number') {
    const converted = new Date(value.seconds * 1000)
    return Number.isNaN(converted.getTime()) ? null : converted
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function formatLisbonTime(value) {
  const date = toDate(value)
  if (!date) return '—'
  return new Intl.DateTimeFormat('pt-PT', {
    timeZone: LISBON_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatLisbonDateTime(value) {
  const date = toDate(value)
  if (!date) return '—'
  return new Intl.DateTimeFormat('pt-PT', {
    timeZone: LISBON_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatLisbonTodayLabel(value = new Date()) {
  const date = toDate(value) ?? new Date()
  return new Intl.DateTimeFormat('pt-PT', {
    timeZone: LISBON_TIMEZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function formatRelativeAge(value, nowMs = Date.now()) {
  const date = toDate(value)
  if (!date) return 'data indisponível'
  const diffMinutes = Math.max(0, Math.round((nowMs - date.getTime()) / 60000))
  if (diffMinutes < 1) return 'agora mesmo'
  if (diffMinutes < 60) return `há ${diffMinutes} min`
  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24) return `há ${diffHours} h`
  const diffDays = Math.round(diffHours / 24)
  return `há ${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`
}

export function getDashboardErrorMessage(error, fallback = 'Ocorreu um erro ao comunicar com o servidor.') {
  const code = error?.code
  if (code === 'permission-denied') {
    return 'Sem permissões no Firestore para aceder a todos os dados do painel.'
  }
  if (code === 'unavailable' || code === 'network-request-failed') {
    return 'Sem ligação ao servidor. Verifique a internet e tente novamente.'
  }
  return fallback
}
