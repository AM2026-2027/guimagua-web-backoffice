// Valores iniciais alinhados com RF-WEB05 e docs/modelo-dados.md (D-11).
export const DEFAULT_ALERT_THRESHOLDS = {
  ph_min: 7.2,
  ph_max: 7.6,
  chlorine_min_ppm: 1.0,
  chlorine_max_ppm: 2.0,
  temperature_min_c: 20,
  temperature_max_c: 32,
}

export const EMPTY_THRESHOLD_FORM = {
  ph_min: String(DEFAULT_ALERT_THRESHOLDS.ph_min),
  ph_max: String(DEFAULT_ALERT_THRESHOLDS.ph_max),
  chlorine_min_ppm: String(DEFAULT_ALERT_THRESHOLDS.chlorine_min_ppm),
  chlorine_max_ppm: String(DEFAULT_ALERT_THRESHOLDS.chlorine_max_ppm),
  temperature_min_c: String(DEFAULT_ALERT_THRESHOLDS.temperature_min_c),
  temperature_max_c: String(DEFAULT_ALERT_THRESHOLDS.temperature_max_c),
}

/** Documento `settings/alert_thresholds` → estado controlado do formulário. */
export function thresholdToFormState(doc) {
  const source = doc ?? DEFAULT_ALERT_THRESHOLDS
  return Object.fromEntries(
    Object.keys(EMPTY_THRESHOLD_FORM).map((key) => {
      const value = source[key] ?? DEFAULT_ALERT_THRESHOLDS[key]
      return [key, value == null ? '' : String(value)]
    }),
  )
}

function toNumber(value) {
  return Number(String(value ?? '').trim().replace(',', '.'))
}

/** Estado do formulário → payload numérico para gravar em `settings/alert_thresholds`. */
export function thresholdToPayload(form) {
  return {
    ph_min: toNumber(form.ph_min),
    ph_max: toNumber(form.ph_max),
    chlorine_min_ppm: toNumber(form.chlorine_min_ppm),
    chlorine_max_ppm: toNumber(form.chlorine_max_ppm),
    temperature_min_c: toNumber(form.temperature_min_c),
    temperature_max_c: toNumber(form.temperature_max_c),
  }
}
