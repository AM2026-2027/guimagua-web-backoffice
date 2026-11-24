import { formatClientNumber } from './labels'

/**
 * Minúsculas e sem acentos ("João" → "joao"). É o formato de `clients.name_lower`, para a pesquisa por
 * prefixo no Firestore encontrar o nome independentemente de maiúsculas e acentos.
 */
export function normalizeText(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

/** Remove espaços (telefone, NIF). */
export function compact(value = '') {
  return String(value).replace(/\s+/g, '')
}

/**
 * Decide que pesquisa fazer no servidor a partir do texto escrito:
 * - com "@" → email (prefixo);
 * - "GP-1082", "#1082" ou até 8 dígitos → número de cliente;
 * - 9 dígitos (ou +351 + 9 dígitos) → NIF ou telefone;
 * - outro texto com 2+ caracteres → nome (prefixo em `name_lower`).
 * Devolve null quando não vale a pena ir ao servidor.
 */
export function parseSearchTerm(raw = '') {
  const term = raw.trim()
  if (!term) return null
  if (term.includes('@')) return { kind: 'email', value: term.toLowerCase() }

  const packed = compact(term)
  const numberMatch = packed.match(/^(?:#?gp-?|#)?(\d{1,8})$/i)
  if (numberMatch) return { kind: 'number', value: numberMatch[1] }

  const nineDigits = packed.match(/^(?:\+351)?(\d{9})$/)
  if (nineDigits) return { kind: 'digits', value: nineDigits[1] }

  const name = normalizeText(term)
  return name.length >= 2 ? { kind: 'name', value: name } : null
}

/** Filtro local (páginas já carregadas): procura em nome, email, telefone, NIF, morada, localidade e número. */
export function clientMatches(client, raw = '') {
  const term = normalizeText(raw)
  if (!term) return true
  const haystack = [
    client.name,
    client.email,
    client.phone,
    client.nif,
    client.address,
    client.city,
    client.postal_code,
    formatClientNumber(client.client_number),
  ]
    .filter(Boolean)
    .map((value) => normalizeText(value))
  const packedTerm = compact(term)
  return haystack.some((value) => value.includes(term) || compact(value).includes(packedTerm))
}
