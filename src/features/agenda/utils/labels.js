export const APPOINTMENT_STATUS_LABELS = {
  scheduled: 'Agendado',
  in_progress: 'Em curso',
  completed: 'Concluído',
  cancelled: 'Cancelado',
}

export const APPOINTMENT_STATUS_OPTIONS = [
  { value: 'all', label: 'Todos os estados' },
  { value: 'scheduled', label: APPOINTMENT_STATUS_LABELS.scheduled },
  { value: 'in_progress', label: APPOINTMENT_STATUS_LABELS.in_progress },
  { value: 'completed', label: APPOINTMENT_STATUS_LABELS.completed },
  { value: 'cancelled', label: APPOINTMENT_STATUS_LABELS.cancelled },
]

export function appointmentStatusLabel(value) {
  return APPOINTMENT_STATUS_LABELS[value] ?? 'Estado desconhecido'
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
