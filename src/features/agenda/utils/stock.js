/**
 * Consumíveis previstos pelo serviço (`services.base_consumables`), só com quantidades positivas.
 * É o que o agendamento reserva no stock projetado ao ser criado e devolve ao ser cancelado (D-10).
 */
export function serviceConsumableDeltas(service) {
  const items = Array.isArray(service?.base_consumables) ? service.base_consumables : []
  // Junta linhas repetidas do mesmo consumível, para cada documento ser atualizado uma única vez.
  const totals = new Map()
  items.forEach((item) => {
    const quantity = Number(item?.quantity)
    if (!item?.consumable_id || !Number.isFinite(quantity) || quantity <= 0) return
    totals.set(item.consumable_id, (totals.get(item.consumable_id) ?? 0) + quantity)
  })
  return [...totals].map(([consumable_id, quantity]) => ({ consumable_id, quantity }))
}

/** Stock projetado guardado; se ainda não existir, usa o stock físico. */
export function currentProjectedStock(consumable) {
  const projected = Number(consumable?.projected_stock)
  if (consumable?.projected_stock != null && Number.isFinite(projected)) return projected
  const physical = Number(consumable?.stock_quantity)
  return Number.isFinite(physical) ? physical : 0
}

/**
 * Situação de cada consumível depois de reservar a quantidade do serviço (alerta de rutura, RF-WEB04):
 * - `missing`: o consumível não existe ou está inativo;
 * - `out_of_stock`: o stock projetado fica abaixo de zero;
 * - `low_stock`: fica igual ou abaixo do `min_stock`;
 * - `ok`: há stock suficiente.
 */
export function stockLines(deltas, consumablesById) {
  return deltas.map((item) => {
    const consumable = consumablesById[item.consumable_id]
    if (!consumable || consumable.is_active === false) {
      return { ...item, consumable: consumable ?? null, available: 0, after: null, level: 'missing' }
    }
    const available = currentProjectedStock(consumable)
    const after = available - item.quantity
    const minStock = Number(consumable.min_stock) || 0
    const level = after < 0 ? 'out_of_stock' : after <= minStock ? 'low_stock' : 'ok'
    return { ...item, consumable, available, after, level }
  })
}

/** Há risco de não haver material: falta stock ou o consumível já não existe. */
export function hasStockRisk(lines) {
  return lines.some((line) => line.level === 'out_of_stock' || line.level === 'missing')
}
