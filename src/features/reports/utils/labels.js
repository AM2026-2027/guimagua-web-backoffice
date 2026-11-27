// Rótulos PT-PT para os valores guardados no Firestore em minúsculas snake_case (D-07).

export const REPORT_TABS = [
  { value: 'interventions', label: 'Intervenções' },
  { value: 'routes', label: 'Rotas da equipa' },
  { value: 'stock', label: 'Movimentos de stock' },
]

export const APPOINTMENT_STATUS = {
  scheduled: { label: 'Agendado', className: 'bg-sky-50 text-primary ring-sky-200' },
  in_progress: { label: 'Em curso', className: 'bg-amber-50 text-amber-800 ring-amber-200' },
  completed: { label: 'Concluído', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  cancelled: { label: 'Cancelado', className: 'bg-slate-100 text-slate-600 ring-slate-200' },
}

export function appointmentStatusLabel(status) {
  return APPOINTMENT_STATUS[status]?.label ?? status ?? '—'
}

export const MOVEMENT_TYPES = [
  { value: '', label: 'Entradas e saídas' },
  { value: 'in', label: 'Só entradas' },
  { value: 'out', label: 'Só saídas' },
]

export function movementTypeLabel(type) {
  return type === 'in' ? 'Entrada' : type === 'out' ? 'Saída' : type ?? '—'
}

const MOVEMENT_SOURCES = {
  initial_stock: 'Stock inicial',
  manual_adjustment: 'Ajuste no backoffice',
  appointment: 'Intervenção',
}

export function movementSourceLabel(source) {
  return MOVEMENT_SOURCES[source] ?? source ?? '—'
}

const DECIMAL = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 2 })

export function formatNumber(value, unit) {
  const number = Number(value)
  if (value === null || value === undefined || !Number.isFinite(number)) return '—'
  return `${DECIMAL.format(number)}${unit ? ` ${unit}` : ''}`
}

/** Minúsculas e sem acentos, para a pesquisa local nas páginas carregadas. */
export function normalizeText(value = '') {
  return String(value ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}
