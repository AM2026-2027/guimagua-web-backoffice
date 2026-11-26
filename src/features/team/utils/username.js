// Username de acesso à App Guimágua (campo novo `users.username`, D-16).
// O técnico entra com o username; a App monta o email da conta como <local>+<username>@<domínio>,
// com a mesma base de email do backoffice (VITE_STAFF_EMAIL_BASE). O link de reposição chega à caixa da base.

export const USERNAME_REGEX = /^[a-z0-9]+(\.[a-z0-9]+)*$/
export const EMAIL_BASE_REGEX = /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

/** Palavras do nome em minúsculas, sem acentos nem símbolos: "José da Silva-Castro" → ["jose", "da", "silvacastro"]. */
function nameParts(name = '') {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .split(/\s+/)
    .map((part) => part.replace(/[^a-z0-9]/g, ''))
    .filter(Boolean)
}

// Partículas que não contam como segundo nome ("Ana da Silva" não dá "ana.d.silva").
const PARTICLES = new Set(['da', 'de', 'do', 'das', 'dos', 'e'])

/**
 * Sugere um username único:
 * 1. primeiroNome.ultimoNome (ex.: bruno.castro);
 * 2. se já existir: primeiroNome.inicialSegundoNome.ultimoNome (ex.: bruno.m.castro);
 * 3. se ainda existir, ou não houver segundo nome: acrescenta um número (bruno.castro2, bruno.castro3…).
 * Com um só nome, usa esse nome. `taken` é um Set com os usernames já atribuídos.
 */
export function suggestUsername(name, taken) {
  const parts = nameParts(name)
  if (parts.length === 0) return ''
  const first = parts[0]
  const last = parts.length > 1 ? parts[parts.length - 1] : null
  const middle = parts.slice(1, -1).find((part) => !PARTICLES.has(part))

  const base = last ? `${first}.${last}` : first
  if (!taken.has(base)) return base

  if (middle && last) {
    const withInitial = `${first}.${middle[0]}.${last}`
    if (!taken.has(withInitial)) return withInitial
  }

  for (let n = 2; ; n += 1) {
    const candidate = `${base}${n}`
    if (!taken.has(candidate)) return candidate
  }
}

/** "ldcc9298@gmail.com" + "bruno.castro" → "ldcc9298+bruno.castro@gmail.com". Devolve null se a base for inválida. */
export function staffEmailFor(username, emailBase) {
  if (!username || !EMAIL_BASE_REGEX.test(emailBase ?? '')) return null
  const [local, domain] = emailBase.split('@')
  return `${local}+${username}@${domain}`.toLowerCase()
}
