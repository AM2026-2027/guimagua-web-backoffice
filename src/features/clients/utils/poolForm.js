import { normalizeDimensions, parseVolume } from './poolValidation'
import { toDate } from './labels'

export const EMPTY_POOL_FORM = {
  name: '',
  // Tipo de piscina obrigatório: começa em "Outro".
  pool_type: 'other',
  local_address: '',
  dimensions: '',
  volume_m3: '',
  treatment_type: '',
  equipment: [],
  notes: '',
}

/** Documento → formulário. Numa piscina nova, a morada da instalação começa com a morada do cliente. */
export function poolToFormState(pool, defaultAddress = '') {
  if (!pool) return { ...EMPTY_POOL_FORM, local_address: defaultAddress }
  return {
    name: pool.name ?? '',
    pool_type: pool.pool_type || 'other',
    local_address: pool.local_address ?? '',
    dimensions: pool.dimensions ?? '',
    volume_m3: pool.volume_m3 == null ? '' : String(pool.volume_m3),
    treatment_type: pool.treatment_type ?? '',
    equipment: Array.isArray(pool.equipment) ? pool.equipment : [],
    notes: pool.notes ?? '',
  }
}

/** Formulário → campos a gravar (sem `client_id`, `is_active` nem timestamps, definidos pelo serviço). */
export function poolToPayload(form) {
  const equipment = [...new Set(form.equipment.map((item) => item.trim()).filter(Boolean))]
  return {
    name: form.name.trim() || null,
    pool_type: form.pool_type,
    local_address: form.local_address.trim(),
    dimensions: normalizeDimensions(form.dimensions),
    volume_m3: parseVolume(form.volume_m3),
    treatment_type: form.treatment_type,
    equipment,
    notes: form.notes.trim() || null,
  }
}

/** Nome a mostrar: o `name` (campo proposto) ou "Piscina N" quando a piscina não tem nome. */
export function poolDisplayName(pool, index = 0) {
  return pool?.name?.trim() || `Piscina ${index + 1}`
}

/** Piscinas ativas primeiro e, dentro de cada grupo, pela ordem de criação. Não altera o array recebido. */
export function sortPools(pools) {
  return pools.toSorted((a, b) => {
    if (a.is_active !== b.is_active) return a.is_active === false ? 1 : -1
    const timeA = toDate(a.created_at)?.getTime() ?? Number.MAX_SAFE_INTEGER
    const timeB = toDate(b.created_at)?.getTime() ?? Number.MAX_SAFE_INTEGER
    return timeA - timeB
  })
}

/**
 * Separa os agendamentos (ordenados por data descendente) em próxima visita e intervenções passadas.
 * `now` vem do hook (momento da leitura) para manter a renderização pura.
 */
export function splitAppointments(appointments, now) {
  const upcoming = appointments
    .filter((item) => item.status === 'scheduled' && (toDate(item.date)?.getTime() ?? 0) >= now)
    .toSorted((a, b) => toDate(a.date) - toDate(b.date))
  const past = appointments.filter((item) => (toDate(item.date)?.getTime() ?? 0) < now)
  return { nextVisit: upcoming[0] ?? null, past: past.slice(0, 5) }
}
