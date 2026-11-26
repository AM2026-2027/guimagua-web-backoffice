import { ROLES, ROLE_LABELS } from '../../../constants/roles'

// Roles geridos neste módulo: só técnicos e comerciais (contas da App Guimágua). O admin é uma conta única
// do backoffice e não é gerido aqui; o role `client` vem da App Cliente.
export const STAFF_ROLE_OPTIONS = [ROLES.TECHNICIAN, ROLES.COMMERCIAL].map((value) => ({
  value,
  label: ROLE_LABELS[value],
}))

export const ROLE_FILTERS = [{ value: 'all', label: 'Todos os perfis' }, ...STAFF_ROLE_OPTIONS]

export const STATUS_FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Ativos' },
  { value: 'inactive', label: 'Inativos' },
]

export function roleLabel(role) {
  return ROLE_LABELS[role] ?? role ?? '—'
}

/**
 * Especialidades técnicas (`users.specialties`), em minúsculas snake_case (D-07).
 * Lista fixa baseada no protótipo da ficha do técnico — validar os valores com a equipa Android.
 */
export const SPECIALTY_OPTIONS = [
  { value: 'water_treatment', label: 'Tratamento de água e cloração', description: 'Eletrólise de sal, doseamento automático, correção de pH e sondas.' },
  { value: 'filtration', label: 'Filtração e cargas filtrantes', description: 'Vidro AFM, areia sílica, filtros e válvulas multiportas.' },
  { value: 'heat_pumps', label: 'Bombas de calor e climatização', description: 'Bombas de calor, desumidificadores e permutadores.' },
  { value: 'automation', label: 'Domótica e automação', description: 'Gateways, quadros elétricos e iluminação LED.' },
  { value: 'leak_detection', label: 'Deteção de fugas e canalização', description: 'Testes de estanquicidade e canalizações de pressão.' },
  { value: 'pool_robots', label: 'Robôs aspiradores e hidráulica', description: 'Diagnóstico e reparação de robôs, motores e turbinas.' },
  { value: 'spas', label: 'Spas e hidromassagem', description: 'Circuitos de hidromassagem, ozono e sanitização.' },
  { value: 'covers', label: 'Segurança e coberturas automáticas', description: 'Lamelas, eixos motores e fins de curso.' },
]

const SPECIALTY_LABELS = Object.fromEntries(SPECIALTY_OPTIONS.map((option) => [option.value, option.label]))

/** Valores desconhecidos (ex.: gravados pela app) aparecem tal como estão. */
export function specialtyLabel(value) {
  return SPECIALTY_LABELS[value] ?? value
}

// Estado operacional calculado a partir dos agendamentos de hoje (não é guardado no Firestore).
export const ACTIVITY_STATUS = {
  in_service: { label: 'Em serviço', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  available: { label: 'Disponível', className: 'bg-sky-50 text-primary ring-sky-200' },
  inactive: { label: 'Inativo', className: 'bg-slate-100 text-slate-600 ring-slate-200' },
}

export function initialsOf(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  return `${parts[0][0]}${parts.length > 1 ? parts[parts.length - 1][0] : ''}`.toUpperCase()
}

const DATE_FORMAT = new Intl.DateTimeFormat('pt-PT', { timeZone: 'Europe/Lisbon', dateStyle: 'medium' })

export function formatDate(value) {
  const date = typeof value?.toDate === 'function' ? value.toDate() : value ? new Date(value) : null
  return date && !Number.isNaN(date.getTime()) ? DATE_FORMAT.format(date) : '—'
}
