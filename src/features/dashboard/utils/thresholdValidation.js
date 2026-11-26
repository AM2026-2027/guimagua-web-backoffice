// Intervalos válidos do dicionário de dados (secção 7. Leituras_Piscina) e docs/modelo-dados.md.
export const PH_RANGE = { min: 6.8, max: 8.2 }
export const CHLORINE_RANGE = { min: 0.5, max: 3.0 }
export const TEMPERATURE_RANGE = { min: 0, max: 45 }

function parseStrictNumber(rawValue) {
  const trimmed = String(rawValue ?? '').trim().replace(',', '.')
  if (!trimmed) return Number.NaN
  return Number(trimmed)
}

function validatePair(errors, minKey, maxKey, form, bounds, label, unit) {
  const minVal = parseStrictNumber(form[minKey])
  const maxVal = parseStrictNumber(form[maxKey])
  const unitSuffix = unit ? ` ${unit}` : ''

  if (!Number.isFinite(minVal) || minVal < bounds.min || minVal > bounds.max) {
    errors[minKey] = `${label} mínimo deve estar entre ${bounds.min} e ${bounds.max}${unitSuffix}.`
  }
  if (!Number.isFinite(maxVal) || maxVal < bounds.min || maxVal > bounds.max) {
    errors[maxKey] = `${label} máximo deve estar entre ${bounds.min} e ${bounds.max}${unitSuffix}.`
  }
  if (!errors[minKey] && !errors[maxKey] && minVal >= maxVal) {
    errors[minKey] = 'O valor mínimo tem de ser inferior ao máximo.'
    errors[maxKey] = 'O valor máximo tem de ser superior ao mínimo.'
  }
}

/**
 * Valida o formulário de limiares de alerta (`settings/alert_thresholds`).
 * Devolve um objeto `{ campo: mensagem }`; vazio = válido.
 */
export function validateAlertThresholds(form) {
  const errors = {}
  validatePair(errors, 'ph_min', 'ph_max', form, PH_RANGE, 'pH', '')
  validatePair(errors, 'chlorine_min_ppm', 'chlorine_max_ppm', form, CHLORINE_RANGE, 'Cloro', 'ppm')
  validatePair(errors, 'temperature_min_c', 'temperature_max_c', form, TEMPERATURE_RANGE, 'Temperatura', '°C')
  return errors
}
