// Mapas de rótulos PT-PT para os valores guardados no Firestore em minúsculas snake_case (D-07).

export const CLIENT_SORT_OPTIONS = [
  { value: 'recent', label: 'Recentes' },
  { value: 'name', label: 'Nome (A-Z)' },
  { value: 'number', label: 'N.º de cliente' },
]

// Tipo de construção da piscina (campo novo `pools.pool_type` — validar com a equipa Android).
export const POOL_TYPE_OPTIONS = [
  { value: 'skimmer', label: 'Skimmer' },
  { value: 'overflow', label: 'Transbordo' },
  { value: 'infinity', label: 'Infinity' },
  { value: 'natural', label: 'Natural / Biológica' },
  { value: 'other', label: 'Outro' },
]

// Tipo de tratamento (`pools.treatment_type`). Valores a confirmar com a equipa Android.
export const TREATMENT_TYPE_OPTIONS = [
  { value: 'chlorine', label: 'Cloro' },
  { value: 'salt', label: 'Sal (eletrólise)' },
  { value: 'other', label: 'Outro' },
]

export const APPOINTMENT_STATUS_LABELS = {
  scheduled: 'Agendado',
  in_progress: 'Em curso',
  completed: 'Concluído',
  cancelled: 'Cancelado',
}

// Sugestões para `pools.equipment` (não há coleção de equipamentos; o admin pode escrever outros).
export const EQUIPMENT_SUGGESTIONS = [
  'Bomba de filtração',
  'Filtro de areia',
  'Filtro de vidro',
  'Clorador salino',
  'Doseador automático',
  'Bomba de calor',
  'Iluminação subaquática',
  'Cobertura automática',
  'Robô de limpeza',
]

function toLabelMap(options) {
  return Object.fromEntries(options.map((option) => [option.value, option.label]))
}

const POOL_TYPE_LABELS = toLabelMap(POOL_TYPE_OPTIONS)
const TREATMENT_TYPE_LABELS = toLabelMap(TREATMENT_TYPE_OPTIONS)

/** Rótulo de um enum; valores desconhecidos (ex.: gravados pela app) aparecem tal como estão. */
export function poolTypeLabel(value) {
  return value ? POOL_TYPE_LABELS[value] ?? value : '—'
}

export function treatmentTypeLabel(value) {
  return value ? TREATMENT_TYPE_LABELS[value] ?? value : '—'
}

export function appointmentStatusLabel(value) {
  return APPOINTMENT_STATUS_LABELS[value] ?? value ?? '—'
}

/** Número de cliente apresentado como "#GP-1082"; clientes sem número (ex.: criados pela app) mostram "—". */
export function formatClientNumber(number) {
  return Number.isFinite(number) ? `#GP-${number}` : '—'
}

export function initialsOf(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  const first = parts[0][0]
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return `${first}${last}`.toUpperCase()
}

// Datas sempre no fuso Europe/Lisbon e formato PT-PT.
const DATE_FORMAT = new Intl.DateTimeFormat('pt-PT', { timeZone: 'Europe/Lisbon', dateStyle: 'medium' })
const DATE_TIME_FORMAT = new Intl.DateTimeFormat('pt-PT', {
  timeZone: 'Europe/Lisbon',
  dateStyle: 'medium',
  timeStyle: 'short',
})

/** Aceita Timestamp do Firestore, Date ou milissegundos. */
export function toDate(value) {
  if (!value) return null
  if (typeof value.toDate === 'function') return value.toDate()
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatDate(value) {
  const date = toDate(value)
  return date ? DATE_FORMAT.format(date) : '—'
}

export function formatDateTime(value) {
  const date = toDate(value)
  return date ? DATE_TIME_FORMAT.format(date) : '—'
}

const VOLUME_FORMAT = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 1 })

export function formatVolume(volume) {
  return Number.isFinite(volume) ? `${VOLUME_FORMAT.format(volume)} m³` : '—'
}
