// Valores guardados no Firestore em minúsculas snake_case (D-07); a UI mostra o rótulo PT-PT.
export const SERVICE_TYPE_LABELS = {
  maintenance: 'Manutenção',
  repair: 'Reparação',
  commercial_survey: 'Vistoria comercial',
}

export const SERVICE_TYPES = Object.entries(SERVICE_TYPE_LABELS).map(([value, label]) => ({ value, label }))

export function serviceTypeLabel(type) {
  return SERVICE_TYPE_LABELS[type] ?? 'Sem tipo'
}
