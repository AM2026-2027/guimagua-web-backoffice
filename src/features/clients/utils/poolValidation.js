import { POOL_TYPE_OPTIONS, TREATMENT_TYPE_OPTIONS } from './labels'

// Dimensões no formato comprimento x largura x altura (profundidade máxima), em metros, ex.: 12x5x1.8.
// Alteração ao dicionário de dados (antes: LxP) — validar com a equipa Android.
export const DIMENSIONS_REGEX = /^\d+(\.\d+)?\s*x\s*\d+(\.\d+)?\s*x\s*\d+(\.\d+)?$/

const POOL_TYPES = new Set(POOL_TYPE_OPTIONS.map((option) => option.value))
const TREATMENT_TYPES = new Set(TREATMENT_TYPE_OPTIONS.map((option) => option.value))
// Margem para arredondamentos de vírgula flutuante (ex.: 12.3 × 4.1 × 1.7).
const VOLUME_TOLERANCE = 1e-6

/** Aceita "12,5 X 5 x 1,8" e devolve "12.5x5x1.8", o formato gravado no Firestore. */
export function normalizeDimensions(value = '') {
  return value.trim().toLowerCase().replace(/,/g, '.').replace(/×/g, 'x').replace(/\s+/g, '')
}

/** Devolve [comprimento, largura, altura] em metros, ou null se o formato não for válido ou houver zeros. */
export function parseDimensions(value = '') {
  const normalized = normalizeDimensions(value)
  if (!DIMENSIONS_REGEX.test(normalized)) return null
  const parts = normalized.split('x').map(Number)
  return parts.every((part) => part > 0) ? parts : null
}

/** Volume máximo que as dimensões permitem: comprimento × largura × altura (m³). */
export function maxVolumeFromDimensions(value = '') {
  const parts = parseDimensions(value)
  return parts ? parts[0] * parts[1] * parts[2] : null
}

export function parseVolume(value) {
  return Number(String(value).replace(',', '.'))
}

/** Valida o formulário da piscina. Devolve { campo: mensagem }; vazio = válido. */
export function validatePool(form) {
  const errors = {}

  if (form.local_address.trim().length < 10) {
    errors.local_address = 'A morada da instalação deve ter pelo menos 10 caracteres.'
  }

  const maxVolume = maxVolumeFromDimensions(form.dimensions)
  if (maxVolume == null) {
    errors.dimensions = 'Use comprimento x largura x altura em metros, todos maiores que 0 (ex.: 12x5x1.8).'
  }

  // O volume tem de ser estritamente positivo (dicionário de dados) e não pode exceder o que as
  // dimensões permitem: comprimento × largura × altura.
  const volume = parseVolume(form.volume_m3)
  if (String(form.volume_m3).trim() === '' || !Number.isFinite(volume) || volume <= 0) {
    errors.volume_m3 = 'Indique um volume em m³ maior que 0.'
  } else if (maxVolume != null && volume > maxVolume + VOLUME_TOLERANCE) {
    errors.volume_m3 = `O volume não pode ser superior a ${formatMaxVolume(maxVolume)} m³ (comprimento × largura × altura).`
  }

  if (!TREATMENT_TYPES.has(form.treatment_type)) errors.treatment_type = 'Escolha o tipo de tratamento.'
  // Tipo de piscina obrigatório; o formulário começa em "Outro".
  if (!POOL_TYPES.has(form.pool_type)) errors.pool_type = 'Escolha o tipo de piscina.'

  return errors
}

const MAX_VOLUME_FORMAT = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 2 })

export function formatMaxVolume(value) {
  return MAX_VOLUME_FORMAT.format(value)
}
