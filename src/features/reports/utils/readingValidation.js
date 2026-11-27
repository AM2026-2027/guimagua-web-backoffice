// Intervalos de integridade do dicionário de dados; salinidade não tem intervalo definido.
const READING_RANGES = {
  ph_level: [6.8, 8.2],
  chlorine_ppm: [0.5, 3],
  temperature_c: [0, 45],
}

export function isValidReading(field, value) {
  if (!Number.isFinite(value)) return false
  const range = READING_RANGES[field]
  return !range || (value >= range[0] && value <= range[1])
}
