import { toDate } from './labels'
import { normalizeText } from './text'

/**
 * Ordenação da tabela, calculada na renderização sobre uma cópia (não altera o estado).
 * 'recent': data de criação descendente; 'name': nome A-Z (sem acentos); 'number': n.º de cliente descendente.
 */
export function sortClients(clients, sort) {
  if (sort === 'name') {
    return clients.toSorted((a, b) => normalizeText(a.name).localeCompare(normalizeText(b.name), 'pt-PT'))
  }
  if (sort === 'number') {
    return clients.toSorted((a, b) => (b.client_number ?? -1) - (a.client_number ?? -1))
  }
  return clients.toSorted(
    (a, b) => (toDate(b.created_at)?.getTime() ?? Infinity) - (toDate(a.created_at)?.getTime() ?? Infinity),
  )
}
