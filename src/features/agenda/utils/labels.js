export const APPOINTMENT_STATUS_LABELS = {
  scheduled: 'Agendado',
  in_progress: 'Em curso',
  completed: 'Concluído',
  cancelled: 'Cancelado',
}

export const APPOINTMENT_STATUS_ORDER = [
  'scheduled',
  'in_progress',
  'completed',
  'cancelled',
]

const APPOINTMENT_STATUS_COUNT_LABELS = {
  scheduled: ['agendada', 'agendadas'],
  in_progress: ['em curso', 'em curso'],
  completed: ['concluída', 'concluídas'],
  cancelled: ['cancelada', 'canceladas'],
}

const SPECIALTY_LABELS = {
  automation: 'Automação',
  covers: 'Coberturas',
  leak_detection: 'Deteção de fugas',
  maintenance: 'Manutenção',
  repair: 'Reparação',
  commercial_survey: 'Vistoria comercial',
}

export const APPOINTMENT_STATUS_OPTIONS = [
  { value: 'all', label: 'Todos os estados' },
  { value: 'scheduled', label: APPOINTMENT_STATUS_LABELS.scheduled },
  { value: 'in_progress', label: APPOINTMENT_STATUS_LABELS.in_progress },
  { value: 'completed', label: APPOINTMENT_STATUS_LABELS.completed },
  { value: 'cancelled', label: APPOINTMENT_STATUS_LABELS.cancelled },
]

export const MONTH_STATUS_OPTIONS = [
  { value: 'not_cancelled', label: 'Todos (sem cancelados)' },
  { value: 'all', label: 'Todos os estados (inclui cancelados)' },
  { value: 'scheduled', label: APPOINTMENT_STATUS_LABELS.scheduled },
  { value: 'in_progress', label: APPOINTMENT_STATUS_LABELS.in_progress },
  { value: 'completed', label: APPOINTMENT_STATUS_LABELS.completed },
  { value: 'cancelled', label: APPOINTMENT_STATUS_LABELS.cancelled },
]

export const MONTH_WEEKDAY_LABELS = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo',
]

export function appointmentStatusLabel(value) {
  return APPOINTMENT_STATUS_LABELS[value] ?? 'Estado desconhecido'
}

export function appointmentStatusCountLabel(value, count) {
  const labels = APPOINTMENT_STATUS_COUNT_LABELS[value]
  if (!labels) return appointmentStatusLabel(value).toLowerCase()
  return labels[count === 1 ? 0 : 1]
}

export function specialtyLabel(value) {
  return SPECIALTY_LABELS[value] ?? value.replaceAll('_', ' ')
}

export function staffRoleLabel(value) {
  if (value === 'commercial') return 'Comercial'
  if (value === 'technician') return 'Técnico'
  return 'Colaborador'
}

export function serviceTypeLabel(value) {
  if (value === 'maintenance') return 'Manutenção'
  if (value === 'repair') return 'Reparação'
  if (value === 'commercial_survey') return 'Vistoria comercial'
  return value || 'Serviço'
}
