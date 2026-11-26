import { SERVICE_TYPE_LABELS } from './labels'

const DEFAULT_DURATION_MIN = 60

// Cada passo da checklist tem um id local só para servir de `key` na lista do formulário;
// no Firestore guarda-se apenas o texto, por ordem (`checklist_template: string[]`).
export function createChecklistStep(text = '') {
  return { id: crypto.randomUUID(), text }
}

export const EMPTY_SERVICE_FORM = {
  name: '',
  description: '',
  type: 'maintenance',
  default_duration_min: String(DEFAULT_DURATION_MIN),
  base_price: '',
  checklist_template: [],
  base_consumables: [],
}

export function toServiceForm(service) {
  if (!service) return { ...EMPTY_SERVICE_FORM, checklist_template: [], base_consumables: [] }
  return {
    name: service.name ?? '',
    description: service.description ?? '',
    type: SERVICE_TYPE_LABELS[service.type] ? service.type : 'maintenance',
    default_duration_min: String(service.default_duration_min ?? DEFAULT_DURATION_MIN),
    base_price: service.base_price === undefined || service.base_price === null ? '' : String(service.base_price),
    checklist_template: (service.checklist_template ?? []).map((text) => createChecklistStep(text)),
    base_consumables: (service.base_consumables ?? []).map((item) => ({
      consumable_id: item.consumable_id,
      quantity: String(item.quantity ?? ''),
    })),
  }
}

/**
 * Valida o formulário e devolve um mapa { campo: mensagem }.
 * Erros da checklist e dos consumíveis usam chaves por id
 * (`checklist_template.<id>`, `base_consumables.<consumable_id>`) para ficarem junto do campo.
 * Um consumível sem stock pode ser escolhido: o serviço é um modelo e o stock repõe-se depois.
 */
export function validateServiceForm(form) {
  const errors = {}
  if (!form.name.trim()) errors.name = 'Indique o nome do serviço.'
  if (!SERVICE_TYPE_LABELS[form.type]) errors.type = 'Selecione um tipo de serviço válido.'

  const duration = Number(form.default_duration_min)
  if (!Number.isInteger(duration) || duration <= 0) {
    errors.default_duration_min = 'A duração tem de ser um número inteiro de minutos superior a zero.'
  }

  // O preço base é obrigatório e é sempre um valor com IVA incluído.
  const price = Number(form.base_price)
  if (form.base_price.trim() === '' || !Number.isFinite(price) || price < 0) {
    errors.base_price = 'Indique um preço válido (0 ou superior).'
  }

  form.checklist_template.forEach((step) => {
    if (!step.text.trim()) errors[`checklist_template.${step.id}`] = 'Escreva o passo ou remova-o.'
  })

  form.base_consumables.forEach((item) => {
    const quantity = Number(item.quantity)
    if (item.quantity.trim() === '' || !Number.isFinite(quantity) || quantity <= 0) {
      errors[`base_consumables.${item.consumable_id}`] = 'A quantidade tem de ser superior a zero.'
    }
  })

  return errors
}

/**
 * Campos editáveis no formulário. O estado (`is_active`) não faz parte: muda-se só pelo
 * interruptor da lista, para a edição não reverter uma ativação/desativação feita entretanto.
 */
export function toServicePayload(form) {
  return {
    name: form.name.trim(),
    description: form.description.trim(),
    type: form.type,
    default_duration_min: Number(form.default_duration_min),
    base_price: Number(form.base_price),
    // A ordem do array é a ordem da checklist mostrada ao técnico na app.
    checklist_template: form.checklist_template.map((step) => step.text.trim()),
    base_consumables: form.base_consumables.map((item) => ({
      consumable_id: item.consumable_id,
      quantity: Number(item.quantity),
    })),
  }
}

/** Um serviço novo entra sempre ativo no catálogo. */
export function toNewServicePayload(form) {
  return { ...toServicePayload(form), is_active: true }
}
