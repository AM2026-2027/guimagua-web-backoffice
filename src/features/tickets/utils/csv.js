import { formatTicketDateTime } from './labels'

function escapeCsv(value) {
  const text = value == null ? '' : String(value)
  return `"${text.replace(/"/g, '""')}"`
}

export function downloadTicketsCsv(tickets) {
  const rows = [
    ['Referência', 'Cliente', 'Localização', 'Categoria', 'Estado', 'Prioridade', 'Descrição', 'Submetido em'],
    ...tickets.map((ticket) => [
      ticket.id,
      ticket.client?.name,
      ticket.pool?.local_address,
      ticket.category,
      ticket.status,
      ticket.priority,
      ticket.description,
      formatTicketDateTime(ticket.created_at),
    ]),
  ]
  const content = `\uFEFF${rows.map((row) => row.map(escapeCsv).join(';')).join('\r\n')}`
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'pedidos-carregados.csv'
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
