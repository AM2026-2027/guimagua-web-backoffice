import { compact, normalizeText } from './text'

export const EMPTY_CLIENT_FORM = {
  name: '',
  email: '',
  phone: '',
  address: '',
  postal_code: '',
  city: '',
  nif: '',
  notes: '',
}

/** Documento do Firestore → estado do formulário (campos em falta passam a string vazia). */
export function clientToFormState(client) {
  if (!client) return EMPTY_CLIENT_FORM
  return Object.fromEntries(
    Object.keys(EMPTY_CLIENT_FORM).map((key) => [key, client[key] == null ? '' : String(client[key])]),
  )
}

function optional(value) {
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

/**
 * Estado do formulário → campos a gravar. Normaliza o email (minúsculas), o telefone e o NIF (sem espaços)
 * e calcula `name_lower` para a pesquisa por nome. Não inclui `client_number`, `user_id`, `is_active`
 * nem timestamps: esses são definidos pelo serviço.
 */
export function clientToPayload(form) {
  const name = form.name.trim()
  return {
    name,
    name_lower: normalizeText(name),
    email: form.email.trim().toLowerCase(),
    phone: compact(form.phone),
    address: form.address.trim(),
    postal_code: optional(form.postal_code),
    city: optional(form.city),
    nif: compact(form.nif) || null,
    notes: optional(form.notes),
  }
}
