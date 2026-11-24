import { compact } from './text'

// Regras do dicionário de dados (secção 1. Clientes).
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
// +351 opcional, seguido de 9 dígitos de telemóvel (91/92/93/96) ou fixo (2x). Valida-se sem espaços.
export const PHONE_REGEX = /^(?:\+351)?(?:9[1236]\d{7}|2\d{8})$/
export const NIF_REGEX = /^\d{9}$/
// Código postal português (campo novo `postal_code` — validar com a equipa Android).
export const POSTAL_CODE_REGEX = /^\d{4}-\d{3}$/

/**
 * Valida o formulário do cliente. Devolve um objeto { campo: mensagem }; vazio = válido.
 * Obrigatórios (RF-WEB01, US01): nome, email, telefone e morada. NIF, código postal, localidade e notas são opcionais.
 */
export function validateClient(form) {
  const errors = {}
  const name = form.name.trim()
  if (name.length < 3 || name.length > 100) errors.name = 'O nome deve ter entre 3 e 100 caracteres.'

  const email = form.email.trim()
  if (!email) errors.email = 'Indique o email.'
  else if (!EMAIL_REGEX.test(email)) errors.email = 'Indique um email válido (ex.: nome@exemplo.pt).'

  const phone = compact(form.phone)
  if (!phone) errors.phone = 'Indique o telefone.'
  else if (!PHONE_REGEX.test(phone)) {
    errors.phone = 'Telefone inválido: 9 dígitos de móvel (91/92/93/96) ou fixo (2…), com +351 opcional.'
  }

  if (!form.address.trim()) errors.address = 'Indique a morada.'

  const postalCode = form.postal_code.trim()
  if (postalCode && !POSTAL_CODE_REGEX.test(postalCode)) errors.postal_code = 'Formato 0000-000.'

  const nif = compact(form.nif)
  if (nif && !NIF_REGEX.test(nif)) errors.nif = 'O NIF tem exatamente 9 dígitos.'

  return errors
}
