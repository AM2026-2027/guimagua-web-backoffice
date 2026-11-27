function normalize(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export function filterReportsBySearch(reports, term) {
  const normalizedTerm = normalize(term).replace(/^#/, '')
  if (!normalizedTerm) return reports

  return reports.filter((report) => {
    const searchableValues = [
      report.id,
      report.client?.name ?? report.client_name,
      report.pool?.name,
      report.pool?.local_address,
      report.technician?.name ?? report.tech_name,
      report.service?.name,
    ]
    return searchableValues.some((value) => normalize(value).includes(normalizedTerm))
  })
}
