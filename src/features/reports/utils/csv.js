function csvCell(value) {
  let text = String(value ?? '')
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return `"${text.replace(/"/g, '""')}"`
}

export function reportsToCsv(reports, formatDateTime) {
  const rows = [
    ['ID da intervenção', 'Data agendada', 'Cliente', 'Piscina', 'Técnico', 'Tipo de serviço', 'Estado', 'PDF disponível'],
    ...reports.map((report) => [
      report.id,
      formatDateTime(report.date),
      report.client?.name ?? report.client_name ?? '',
      report.pool?.name ?? report.pool?.local_address ?? '',
      report.technician?.name ?? report.tech_name ?? '',
      report.service?.name ?? '',
      report.status,
      report.report_pdf_path ? 'Sim' : 'Não',
    ]),
  ]
  return `\uFEFF${rows.map((row) => row.map(csvCell).join(',')).join('\r\n')}`
}
