import { serviceTypeLabel } from './labels'

const COLUMNS = [
  'Serviço',
  'Descrição',
  'Tipo',
  'Duração (minutos)',
  'Preço base com IVA (€)',
  'Passos da checklist',
  'Produtos obrigatórios',
  'Estado',
]

// Proteção contra injeção de fórmulas: o Excel executa células que começam por = + - @.
function toCell(value) {
  const text = String(value ?? '')
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text
  return `"${safe.replaceAll('"', '""')}"`
}

/** Gera o CSV do catálogo (separador ";" e BOM para o Excel PT abrir os acentos corretamente). */
export function buildCatalogCsv(services) {
  const rows = services.map((service) => [
    service.name,
    service.description,
    serviceTypeLabel(service.type),
    service.default_duration_min,
    service.base_price,
    (service.checklist_template ?? []).length,
    (service.base_consumables ?? []).length,
    service.is_active === false ? 'Inativo' : 'Ativo',
  ])
  const csv = [COLUMNS, ...rows].map((row) => row.map(toCell).join(';')).join('\r\n')
  return `${String.fromCharCode(0xfeff)}${csv}`
}
