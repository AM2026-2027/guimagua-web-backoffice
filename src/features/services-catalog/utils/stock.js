// Cobertura de stock de um produto obrigatório, comparando o stock físico em armazém
// (`consumables.stock_quantity`) com a quantidade necessária para UMA intervenção do serviço.

// Margem mínima de segurança: stock que só chega para 3 intervenções (ou menos) fica a amarelo.
export const SAFETY_MARGIN_SERVICES = 3

export const STOCK_LEVEL = {
  SURPLUS: 'surplus', // verde: stock de sobra (mais de 3 intervenções)
  MARGIN: 'margin', // amarelo: chega para 1 a 3 intervenções
  INSUFFICIENT: 'insufficient', // vermelho: não chega para 1 intervenção
  UNKNOWN: 'unknown', // consumível não encontrado, sem stock registado ou quantidade inválida
}

export const STOCK_LEVEL_LABELS = {
  [STOCK_LEVEL.SURPLUS]: 'Stock de sobra',
  [STOCK_LEVEL.MARGIN]: `Stock só para ${SAFETY_MARGIN_SERVICES} intervenções ou menos`,
  [STOCK_LEVEL.INSUFFICIENT]: 'Stock insuficiente para 1 intervenção',
  [STOCK_LEVEL.UNKNOWN]: 'Stock por confirmar',
}

/**
 * Calcula a cobertura: saldo = stock − necessário. Se o saldo for ≥ 0 há stock para pelo menos
 * uma intervenção; `services` é o número de intervenções completas que o stock permite.
 */
export function stockCoverage(consumable, requiredQuantity) {
  const required = Number(requiredQuantity)
  const hasStock = consumable && consumable.stock_quantity !== undefined && consumable.stock_quantity !== null
  const stock = hasStock ? Number(consumable.stock_quantity) : NaN
  if (!Number.isFinite(stock) || !Number.isFinite(required) || required <= 0) {
    return { level: STOCK_LEVEL.UNKNOWN, stock: Number.isFinite(stock) ? stock : null, required: null, balance: null, services: null }
  }

  const balance = stock - required
  const services = Math.max(0, Math.floor(stock / required))
  let level = STOCK_LEVEL.SURPLUS
  if (balance < 0) level = STOCK_LEVEL.INSUFFICIENT
  else if (services <= SAFETY_MARGIN_SERVICES) level = STOCK_LEVEL.MARGIN

  return { level, stock, required, balance, services }
}

const numberFormatter = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 3 })

export function formatQuantity(value, unit) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return '—'
  return `${numberFormatter.format(Number(value))}${unit ? ` ${unit}` : ''}`
}

/**
 * Propõe alternativas para um produto com stock insuficiente ou na margem mínima: consumíveis
 * ativos, ainda não associados ao serviço, da mesma categoria (ou, sem categoria, da mesma
 * unidade) e com stock de sobra para a mesma quantidade. Ordena do maior para o menor stock.
 */
export function findAlternatives(consumable, requiredQuantity, consumables, excludedIds, max = 3) {
  if (!consumable) return []
  const sameGroup = consumable.category
    ? (candidate) => candidate.category === consumable.category
    : (candidate) => Boolean(consumable.unit) && candidate.unit === consumable.unit

  return consumables
    .filter((candidate) => (
      candidate.id !== consumable.id
      && !excludedIds.has(candidate.id)
      && candidate.is_active !== false
      && sameGroup(candidate)
      && stockCoverage(candidate, requiredQuantity).level === STOCK_LEVEL.SURPLUS
    ))
    .toSorted((first, second) => Number(second.stock_quantity) - Number(first.stock_quantity))
    .slice(0, max)
}

// Gravidade de cada nível, para encontrar o pior artigo de um serviço.
const LEVEL_SEVERITY = {
  [STOCK_LEVEL.INSUFFICIENT]: 3,
  [STOCK_LEVEL.MARGIN]: 2,
  [STOCK_LEVEL.SURPLUS]: 1,
  [STOCK_LEVEL.UNKNOWN]: 0,
}

/**
 * Alerta de stock de um serviço = o pior nível entre os seus produtos obrigatórios.
 * Um serviço com um artigo a vermelho conta só como vermelho (mesmo que tenha outros a amarelo),
 * para os contadores e filtros não repetirem serviços. Sem produtos (ou por carregar) → UNKNOWN.
 */
export function serviceStockLevel(service, consumablesById) {
  return (service.base_consumables ?? []).reduce((worst, item) => {
    const level = stockCoverage(consumablesById.get(item.consumable_id), item.quantity).level
    return LEVEL_SEVERITY[level] > LEVEL_SEVERITY[worst] ? level : worst
  }, STOCK_LEVEL.UNKNOWN)
}
