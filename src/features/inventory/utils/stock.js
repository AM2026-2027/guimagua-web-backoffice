/**
 * Stock comprometido por consumível (D-10): soma de `services.base_consumables[].quantity` de todos os
 * agendamentos que ainda vão consumir material (`scheduled` ou `in_progress`). Calculado no cliente.
 * Devolve um Map consumable_id → quantidade comprometida.
 */
export function committedByConsumable(appointments, services) {
  const servicesById = new Map(services.map((service) => [service.id, service]))
  const committed = new Map()
  for (const appointment of appointments) {
    const service = servicesById.get(appointment.service_id)
    for (const item of service?.base_consumables ?? []) {
      const quantity = Number(item.quantity)
      if (!item.consumable_id || !Number.isFinite(quantity) || quantity <= 0) continue
      committed.set(item.consumable_id, (committed.get(item.consumable_id) ?? 0) + quantity)
    }
  }
  return committed
}

/** Stock projetado = físico − comprometido (D-10). */
export function projectedStock(consumable, committed) {
  return (Number(consumable.stock_quantity) || 0) - (committed ?? 0)
}

/**
 * Estado do artigo a partir do stock projetado:
 * - inativo, se `is_active` for false;
 * - sem stock, se o projetado for ≤ 0;
 * - stock baixo, se o projetado for ≤ `min_stock`;
 * - em stock, nos restantes casos.
 */
export function stockStatus(consumable, projected) {
  if (consumable.is_active === false) return 'inactive'
  if (projected <= 0) return 'out_of_stock'
  if (projected <= (Number(consumable.min_stock) || 0)) return 'low_stock'
  return 'in_stock'
}

/** Stock físico depois de um ajuste; null se a saída o deixasse negativo. */
export function stockAfterAdjustment(current, direction, quantity) {
  const delta = direction === 'out' ? -quantity : quantity
  const next = (Number(current) || 0) + delta
  return next < 0 ? null : next
}
