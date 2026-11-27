import { toDate } from './labels'

function normalizeText(value = '') {
  return value
    .toLocaleLowerCase('pt-PT')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function sortTicketsFIFO(tickets) {
  return tickets.toSorted(
    (a, b) => (toDate(a.created_at)?.getTime() ?? Infinity) - (toDate(b.created_at)?.getTime() ?? Infinity),
  )
}

export function filterTicketsBySearch(tickets, searchTerm) {
  const normalizedTerm = normalizeText(searchTerm.trim())
  if (!normalizedTerm) return tickets

  return tickets.filter((ticket) => {
    const searchable = [
      ticket.id,
      ticket.client?.name,
      ticket.pool?.local_address,
    ]
      .filter(Boolean)
      .join(' ')
    return normalizeText(searchable).includes(normalizedTerm)
  })
}
