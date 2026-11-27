import { appointmentStatusLabel, normalizeText } from './labels'
import { formatDateTime } from './dates'

/**
 * Junta a cada agendamento os nomes já carregados (cliente, piscina, técnico, serviço), para a tabela,
 * a pesquisa local e a exportação. `lookups`: { clients, pools, staff, services } (Maps por id).
 */
export function decorateAppointment(appointment, lookups) {
  const pool = lookups.pools.get(appointment.pool_id)
  const clientId = appointment.client_id ?? pool?.client_id
  const client = lookups.clients.get(clientId)
  const tech = lookups.staff.get(appointment.tech_id)
  const service = lookups.services.get(appointment.service_id)
  return {
    ...appointment,
    clientName: client?.name ?? appointment.client_name ?? '—',
    poolName: pool?.name || pool?.local_address || '—',
    techName: tech?.name ?? appointment.tech_name ?? '—',
    serviceName: service?.name ?? '—',
  }
}

/** Pesquisa local (páginas já carregadas): cliente, piscina, técnico, serviço e notas. */
export function matchesIntervention(row, term) {
  const needle = normalizeText(term)
  if (!needle) return true
  return [row.clientName, row.poolName, row.techName, row.serviceName, row.notes].some((value) => normalizeText(value).includes(needle))
}

/** Checklist `map<string, boolean>` → lista ordenada pela ordem de inserção. */
export function checklistEntries(checklistResults) {
  if (!checklistResults || typeof checklistResults !== 'object') return []
  return Object.entries(checklistResults).map(([task, done]) => ({ task, done: Boolean(done) }))
}

/** Colunas da exportação CSV do histórico de intervenções. */
export const INTERVENTION_CSV_COLUMNS = [
  { header: 'Data', value: (row) => formatDateTime(row.date) },
  { header: 'Estado', value: (row) => appointmentStatusLabel(row.status) },
  { header: 'Cliente', value: (row) => row.clientName },
  { header: 'Piscina', value: (row) => row.poolName },
  { header: 'Serviço', value: (row) => row.serviceName },
  { header: 'Técnico', value: (row) => row.techName },
  { header: 'Check-in', value: (row) => formatDateTime(row.checkin_timestamp) },
  { header: 'Anomalia', value: (row) => (row.anomaly_reported ? 'Sim' : 'Não') },
  { header: 'Consumíveis usados', value: (row) => (row.consumables_used ?? []).length },
  { header: 'Fotografias', value: (row) => (row.photo_paths ?? []).length },
  { header: 'Notas', value: (row) => row.notes ?? '' },
]

