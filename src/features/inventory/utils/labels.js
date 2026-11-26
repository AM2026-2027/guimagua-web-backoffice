// Rótulos PT-PT e listas fixas do inventário. Valores guardados em minúsculas snake_case (D-07).

/**
 * Categorias (`consumables.category`) e prefixo do SKU automático de cada uma (ex.: QUI-0001).
 * Valores a validar com a equipa Android.
 */
export const CATEGORY_OPTIONS = [
  { value: 'chemicals', label: 'Químicos e tratamento', skuPrefix: 'QUI' },
  { value: 'filtration', label: 'Filtração', skuPrefix: 'FIL' },
  { value: 'equipment', label: 'Equipamentos', skuPrefix: 'EQP' },
  { value: 'parts', label: 'Peças', skuPrefix: 'PEC' },
  { value: 'cleaning_accessories', label: 'Acessórios de limpeza', skuPrefix: 'LIM' },
  { value: 'other', label: 'Outro', skuPrefix: 'OUT' },
]

const CATEGORY_BY_VALUE = Object.fromEntries(CATEGORY_OPTIONS.map((option) => [option.value, option]))

export function categoryLabel(value) {
  return CATEGORY_BY_VALUE[value]?.label ?? value ?? '—'
}

export function skuPrefixFor(category) {
  return CATEGORY_BY_VALUE[category]?.skuPrefix ?? null
}

// Unidades: símbolos guardados tal como aparecem (compatível com o catálogo de serviços).
export const UNIT_OPTIONS = ['un', 'kg', 'g', 'L', 'mL', 'cx', 'saco', 'balde']

// Estado calculado a partir do stock projetado e do stock mínimo (não é guardado no Firestore).
export const STOCK_STATUS = {
  in_stock: { label: 'Em stock', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  low_stock: { label: 'Stock baixo', className: 'bg-amber-50 text-amber-800 ring-amber-200' },
  out_of_stock: { label: 'Sem stock', className: 'bg-red-50 text-red-700 ring-red-200' },
  inactive: { label: 'Inativo', className: 'bg-slate-100 text-slate-600 ring-slate-200' },
}

const QUANTITY_FORMAT = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 2 })
const PRICE_FORMAT = new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' })

export function formatQuantity(value, unit) {
  const number = Number(value)
  if (value === null || value === undefined || !Number.isFinite(number)) return '—'
  return `${QUANTITY_FORMAT.format(number)}${unit ? ` ${unit}` : ''}`
}

export function formatPrice(value) {
  const number = Number(value)
  return value === null || value === undefined || !Number.isFinite(number) ? '—' : PRICE_FORMAT.format(number)
}

/** Minúsculas e sem acentos, para a pesquisa local. */
export function normalizeText(value = '') {
  return String(value).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}
