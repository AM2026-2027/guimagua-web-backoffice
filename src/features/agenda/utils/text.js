export function normalizeSearchText(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export function appointmentMatchesSearch(appointment, searchTerm) {
  const term = normalizeSearchText(searchTerm)
  if (!term) return true

  const searchable = [
    appointment.staff?.name,
    appointment.client?.name,
    appointment.client?.address,
    appointment.pool?.local_address,
    appointment.service?.name,
  ]
    .filter(Boolean)
    .map(normalizeSearchText)

  return searchable.some((value) => value.includes(term))
}
