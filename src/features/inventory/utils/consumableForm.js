export const EMPTY_CONSUMABLE_FORM = {
  name: '',
  category: '',
  unit: 'un',
  description: '',
  supplier: '',
  unit_price: '',
  min_stock: '',
  stock_quantity: '',
}

/** Documento → formulário (os números passam a texto para os inputs controlados). */
export function consumableToFormState(consumable) {
  if (!consumable) return EMPTY_CONSUMABLE_FORM
  const text = (value) => (value === null || value === undefined ? '' : String(value))
  return {
    name: consumable.name ?? '',
    category: consumable.category ?? '',
    unit: consumable.unit ?? 'un',
    description: consumable.description ?? '',
    supplier: consumable.supplier ?? '',
    unit_price: text(consumable.unit_price),
    min_stock: text(consumable.min_stock),
    stock_quantity: text(consumable.stock_quantity),
  }
}

function toNumber(value) {
  return Number(String(value).trim().replace(',', '.'))
}

/**
 * Formulário → campos a gravar. Na criação inclui o stock físico inicial; na edição o stock só muda
 * pelos ajustes de entrada/saída. O SKU, `projected_stock`, `is_active` e os timestamps são do serviço.
 */
export function consumableToPayload(form, { isCreate }) {
  const payload = {
    name: form.name.trim(),
    category: form.category,
    unit: form.unit,
    description: form.description.trim(),
    supplier: form.supplier.trim(),
    unit_price: Math.round(toNumber(form.unit_price) * 100) / 100,
    min_stock: toNumber(form.min_stock),
  }
  return isCreate ? { ...payload, stock_quantity: toNumber(form.stock_quantity) } : payload
}
