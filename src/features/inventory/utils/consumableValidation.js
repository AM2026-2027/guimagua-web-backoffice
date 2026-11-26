import { CATEGORY_OPTIONS, UNIT_OPTIONS } from './labels'

const CATEGORIES = new Set(CATEGORY_OPTIONS.map((option) => option.value))
const UNITS = new Set(UNIT_OPTIONS)

function toNumber(value) {
  const text = String(value).trim().replace(',', '.')
  return text === '' ? NaN : Number(text)
}

/** Inteiro ≥ 0 (dicionário de dados: stock físico é Integer e nunca negativo). */
export function isNonNegativeInteger(value) {
  const number = toNumber(value)
  return Number.isInteger(number) && number >= 0
}

/**
 * Valida o formulário do artigo. Devolve { campo: mensagem }; vazio = válido.
 * Todos os campos são obrigatórios. O SKU é atribuído automaticamente e não é validado aqui.
 * Na criação (`isCreate`) valida também o stock físico inicial.
 */
export function validateConsumable(form, { isCreate }) {
  const errors = {}

  if (form.name.trim().length < 3) errors.name = 'O nome deve ter pelo menos 3 caracteres.'
  if (!CATEGORIES.has(form.category)) errors.category = 'Escolha a categoria.'
  if (!UNITS.has(form.unit)) errors.unit = 'Escolha a unidade.'
  if (!form.description.trim()) errors.description = 'Indique a descrição.'
  if (!form.supplier.trim()) errors.supplier = 'Indique o fornecedor.'

  // Preço unitário ≥ 0 (o dicionário aceita 0 para ofertas e serviços incluídos).
  const price = toNumber(form.unit_price)
  if (!Number.isFinite(price) || price < 0) errors.unit_price = 'Indique um preço em euros igual ou superior a 0.'

  if (!isNonNegativeInteger(form.min_stock)) errors.min_stock = 'Indique um número inteiro igual ou superior a 0.'

  if (isCreate && !isNonNegativeInteger(form.stock_quantity)) {
    errors.stock_quantity = 'Indique um número inteiro igual ou superior a 0.'
  }

  return errors
}

/** Valida o ajuste de stock: quantidade inteira > 0 e sem deixar o físico negativo. */
export function validateAdjustment(quantity, resultingStock) {
  const number = toNumber(quantity)
  if (!Number.isInteger(number) || number <= 0) return 'Indique uma quantidade inteira maior que 0.'
  if (resultingStock === null) return 'A saída não pode deixar o stock físico negativo.'
  return ''
}
