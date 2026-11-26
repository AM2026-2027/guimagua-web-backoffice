import { ROLES } from '../../../constants/roles'
import { SPECIALTY_OPTIONS } from './labels'

const KNOWN_SPECIALTIES = new Set(SPECIALTY_OPTIONS.map((option) => option.value))

export const EMPTY_STAFF_FORM = {
  name: '',
  phone: '',
  role: ROLES.TECHNICIAN,
  specialties: [],
}

/** Documento `users/{uid}` → formulário. Especialidades desconhecidas mantêm-se para não se perderem. */
export function staffToFormState(user) {
  if (!user) return EMPTY_STAFF_FORM
  return {
    name: user.name ?? '',
    phone: user.phone ?? '',
    role: user.role ?? ROLES.TECHNICIAN,
    specialties: Array.isArray(user.specialties) ? user.specialties : [],
  }
}

/**
 * Formulário → campos a gravar. Na criação inclui o `username` gerado e o `email` derivado dele (D-16);
 * na edição nenhum dos dois é enviado (estão ligados à conta do Firebase Auth).
 * As especialidades seguem a ordem da lista oficial.
 */
export function staffToPayload(form, { isCreate, username, email }) {
  const ordered = [
    ...SPECIALTY_OPTIONS.map((option) => option.value).filter((value) => form.specialties.includes(value)),
    ...form.specialties.filter((value) => !KNOWN_SPECIALTIES.has(value)),
  ]
  const payload = {
    name: form.name.trim(),
    phone: form.phone.replace(/\s+/g, ''),
    role: form.role,
    specialties: ordered,
  }
  return isCreate ? { ...payload, username, email } : payload
}
