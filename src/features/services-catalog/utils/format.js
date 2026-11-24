const currencyFormatter = new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' })

export function formatPrice(price) {
  if (price === null || price === undefined || price === '' || !Number.isFinite(Number(price))) return '—'
  return currencyFormatter.format(Number(price))
}

/** Converte minutos em "1h 30m" / "45 min". */
export function formatDuration(minutes) {
  const total = Number(minutes)
  if (!Number.isFinite(total) || total <= 0) return '—'
  const hours = Math.floor(total / 60)
  const remainingMinutes = total % 60
  if (hours === 0) return `${remainingMinutes} min`
  return `${hours}h ${String(remainingMinutes).padStart(2, '0')}m`
}

/** Preço base válido: número finito e não negativo (ignora documentos sem preço). */
export function hasValidPrice(service) {
  return typeof service.base_price === 'number' && Number.isFinite(service.base_price) && service.base_price >= 0
}
