// Valores iniciais de acordo com RF-WEB05 (pH 7.2–7.6) e limites válidos do dicionário de dados (D-11).
export const DEFAULT_THRESHOLDS = {
  ph_min: 7.2,
  ph_max: 7.6,
  chlorine_min_ppm: 1.0,
  chlorine_max_ppm: 2.0,
  temperature_min_c: 22,
  temperature_max_c: 30,
}

// Limites de integridade definidos no dicionário de dados (Leituras_Piscina) e em docs/modelo-dados.md.
export const THRESHOLD_LIMITS = {
  ph: { min: 6.8, max: 8.2, label: 'pH', unit: '' },
  chlorine: { min: 0.5, max: 3.0, label: 'Cloro livre', unit: 'ppm' },
  temperature: { min: 0, max: 45, label: 'Temperatura', unit: '°C' },
}

export function resolveThresholds(raw) {
  if (!raw) return { ...DEFAULT_THRESHOLDS }
  return {
    ph_min: Number.isFinite(Number(raw.ph_min)) ? Number(raw.ph_min) : DEFAULT_THRESHOLDS.ph_min,
    ph_max: Number.isFinite(Number(raw.ph_max)) ? Number(raw.ph_max) : DEFAULT_THRESHOLDS.ph_max,
    chlorine_min_ppm: Number.isFinite(Number(raw.chlorine_min_ppm))
      ? Number(raw.chlorine_min_ppm)
      : DEFAULT_THRESHOLDS.chlorine_min_ppm,
    chlorine_max_ppm: Number.isFinite(Number(raw.chlorine_max_ppm))
      ? Number(raw.chlorine_max_ppm)
      : DEFAULT_THRESHOLDS.chlorine_max_ppm,
    temperature_min_c: Number.isFinite(Number(raw.temperature_min_c))
      ? Number(raw.temperature_min_c)
      : DEFAULT_THRESHOLDS.temperature_min_c,
    temperature_max_c: Number.isFinite(Number(raw.temperature_max_c))
      ? Number(raw.temperature_max_c)
      : DEFAULT_THRESHOLDS.temperature_max_c,
    updated_at: raw.updated_at ?? null,
    updated_by: raw.updated_by ?? null,
  }
}

export function toThresholdsFormState(thresholds) {
  const resolved = resolveThresholds(thresholds)
  return {
    ph_min: String(resolved.ph_min),
    ph_max: String(resolved.ph_max),
    chlorine_min_ppm: String(resolved.chlorine_min_ppm),
    chlorine_max_ppm: String(resolved.chlorine_max_ppm),
    temperature_min_c: String(resolved.temperature_min_c),
    temperature_max_c: String(resolved.temperature_max_c),
  }
}

function parseFieldNumber(rawValue) {
  const normalized = String(rawValue ?? '').trim().replace(',', '.')
  if (!normalized) return null
  const num = Number(normalized)
  return Number.isFinite(num) ? num : null
}

function validatePair(form, minKey, maxKey, bounds, errors) {
  const minVal = parseFieldNumber(form[minKey])
  const maxVal = parseFieldNumber(form[maxKey])
  const suffix = bounds.unit ? ` ${bounds.unit}` : ''

  if (minVal === null || minVal < bounds.min || minVal > bounds.max) {
    errors[minKey] = `Deve estar entre ${bounds.min} e ${bounds.max}${suffix}.`
  }
  if (maxVal === null || maxVal < bounds.min || maxVal > bounds.max) {
    errors[maxKey] = `Deve estar entre ${bounds.min} e ${bounds.max}${suffix}.`
  }
  if (!errors[minKey] && !errors[maxKey] && minVal >= maxVal) {
    errors[minKey] = 'O mínimo tem de ser inferior ao máximo.'
    errors[maxKey] = 'O máximo tem de ser superior ao mínimo.'
  }

  return { minVal, maxVal }
}

/** Valida os 6 limiares contra os intervalos oficiais e devolve `{ errors, payload }`. */
export function validateThresholdsForm(form) {
  const errors = {}
  const ph = validatePair(form, 'ph_min', 'ph_max', THRESHOLD_LIMITS.ph, errors)
  const chlorine = validatePair(form, 'chlorine_min_ppm', 'chlorine_max_ppm', THRESHOLD_LIMITS.chlorine, errors)
  const temperature = validatePair(form, 'temperature_min_c', 'temperature_max_c', THRESHOLD_LIMITS.temperature, errors)

  if (Object.keys(errors).length > 0) {
    return { errors, payload: null }
  }

  return {
    errors,
    payload: {
      ph_min: Number(ph.minVal),
      ph_max: Number(ph.maxVal),
      chlorine_min_ppm: Number(chlorine.minVal),
      chlorine_max_ppm: Number(chlorine.maxVal),
      temperature_min_c: Number(temperature.minVal),
      temperature_max_c: Number(temperature.maxVal),
    },
  }
}

/**
 * Avalia uma leitura (`pool_readings`) face aos limiares de `settings/alert_thresholds` (D-12).
 * Devolve a lista de parâmetros fora do intervalo configurado.
 */
export function evaluateReadingAlerts(reading, thresholds) {
  const active = resolveThresholds(thresholds)
  const deviations = []

  const checks = [
    {
      key: 'ph_level',
      label: 'pH',
      unit: '',
      value: reading?.ph_level,
      min: active.ph_min,
      max: active.ph_max,
      severity: 'critical',
    },
    {
      key: 'chlorine_ppm',
      label: 'Cloro livre',
      unit: 'ppm',
      value: reading?.chlorine_ppm,
      min: active.chlorine_min_ppm,
      max: active.chlorine_max_ppm,
      severity: 'critical',
    },
    {
      key: 'temperature_c',
      label: 'Temperatura',
      unit: '°C',
      value: reading?.temperature_c,
      min: active.temperature_min_c,
      max: active.temperature_max_c,
      severity: 'warning',
    },
  ]

  checks.forEach((check) => {
    if (check.value === null || check.value === undefined || check.value === '') return
    const numeric = Number(check.value)
    if (!Number.isFinite(numeric)) return

    if (numeric < check.min) {
      deviations.push({ ...check, value: numeric, direction: 'low' })
    } else if (numeric > check.max) {
      deviations.push({ ...check, value: numeric, direction: 'high' })
    }
  })

  return deviations
}

/**
 * Um artigo está em stock crítico se o stock físico ou o stock projetado (D-10)
 * atingirem ou ficarem abaixo do limiar mínimo configurado (`min_stock`).
 */
export function isCriticalConsumable(item) {
  if (!item || item.is_active === false) return false
  if (item.min_stock === null || item.min_stock === undefined || item.min_stock === '') return false

  const minStock = Number(item.min_stock)
  if (!Number.isFinite(minStock)) return false

  const physical = Number(item.stock_quantity)
  const projected = item.projected_stock !== null && item.projected_stock !== undefined ? Number(item.projected_stock) : null

  const physicalLow = Number.isFinite(physical) && physical <= minStock
  const projectedLow = projected !== null && Number.isFinite(projected) && projected <= minStock

  return physicalLow || projectedLow
}

export function formatPtNumber(value, decimals = 1) {
  const num = Number(value)
  if (!Number.isFinite(num)) return '—'
  return new Intl.NumberFormat('pt-PT', {
    minimumFractionDigits: Number.isInteger(num) ? 0 : decimals,
    maximumFractionDigits: decimals,
  }).format(num)
}
