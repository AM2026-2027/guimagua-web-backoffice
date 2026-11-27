export const REPORT_TYPE_OPTIONS = [
  { value: 'maintenance', label: 'Manutenção' },
  { value: 'repair', label: 'Reparação' },
  { value: 'commercial_survey', label: 'Vistoria comercial' },
]

export const APPOINTMENT_STATUS_LABELS = {
  scheduled: 'Agendado',
  in_progress: 'Em curso',
  completed: 'Concluído',
  cancelled: 'Cancelado',
}

const TYPE_LABELS = Object.fromEntries(REPORT_TYPE_OPTIONS.map((option) => [option.value, option.label]))
const POOL_TREATMENT_LABELS = { chlorine: 'Cloro', salt: 'Sal', other: 'Outro' }

export function reportTypeLabel(value) {
  return value ? TYPE_LABELS[value] ?? value : '—'
}

export function poolTreatmentLabel(value) {
  return value ? POOL_TREATMENT_LABELS[value] ?? value : ''
}

export function appointmentStatusLabel(value) {
  return value ? APPOINTMENT_STATUS_LABELS[value] ?? value : '—'
}

export function technicianInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  return `${parts[0][0]}${parts.length > 1 ? parts[parts.length - 1][0] : ''}`.toUpperCase()
}

export function formatReading(value, maximumFractionDigits = 1) {
  if (!Number.isFinite(value)) return '—'
  return new Intl.NumberFormat('pt-PT', { maximumFractionDigits }).format(value)
}
