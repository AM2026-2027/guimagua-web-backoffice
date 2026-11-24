export const SERVICE_CATEGORIES = [
  { value: 'chemical_treatment', label: 'Tratamento Químico' },
  { value: 'periodic_maintenance', label: 'Manutenção Periódica' },
  { value: 'iot_hardware', label: 'Hardware IoT' },
  { value: 'hydraulic_repair', label: 'Reparação Hidráulica' },
  { value: 'seasonal_diagnostics', label: 'Sazonal & Diagnóstico' },
]

export const EMPTY_SERVICE_FORM = {
  code: '',
  name: '',
  description: '',
  category: SERVICE_CATEGORIES[0].value,
  estimated_duration_minutes: '60',
  included_items: '',
  base_price: '',
  vat_included: false,
  is_active: true,
  is_iot_enabled: false,
}

export function toServiceForm(service) {
  if (!service) return { ...EMPTY_SERVICE_FORM }
  return {
    code: service.code ?? '',
    name: service.name ?? '',
    description: service.description ?? '',
    category: service.category ?? SERVICE_CATEGORIES[0].value,
    estimated_duration_minutes: String(service.estimated_duration_minutes ?? 60),
    included_items: service.included_items ?? '',
    base_price: String(service.base_price ?? ''),
    vat_included: Boolean(service.vat_included),
    is_active: service.is_active !== false,
    is_iot_enabled: Boolean(service.is_iot_enabled),
  }
}

export function validateServiceForm(form) {
  const errors = {}
  if (!form.code.trim()) errors.code = 'Indique o código do serviço.'
  if (!form.name.trim()) errors.name = 'Indique o nome do serviço.'
  if (!SERVICE_CATEGORIES.some(({ value }) => value === form.category)) {
    errors.category = 'Selecione uma categoria válida.'
  }

  const duration = Number(form.estimated_duration_minutes)
  if (!Number.isInteger(duration) || duration <= 0) {
    errors.estimated_duration_minutes = 'A duração tem de ser um número inteiro superior a zero.'
  }

  const price = Number(form.base_price)
  if (!Number.isFinite(price) || price < 0) errors.base_price = 'Indique um preço válido.'
  return errors
}

export function toServicePayload(form) {
  return {
    code: form.code.trim().toUpperCase(),
    name: form.name.trim(),
    description: form.description.trim(),
    category: form.category,
    estimated_duration_minutes: Number(form.estimated_duration_minutes),
    included_items: form.included_items.trim(),
    base_price: Number(form.base_price),
    vat_included: Boolean(form.vat_included),
    is_active: Boolean(form.is_active),
    is_iot_enabled: Boolean(form.is_iot_enabled),
  }
}
