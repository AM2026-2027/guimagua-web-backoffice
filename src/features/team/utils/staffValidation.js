import { ROLES } from '../../../constants/roles'
import { SPECIALTY_OPTIONS, STAFF_ROLE_OPTIONS } from './labels'
import { EMAIL_BASE_REGEX, USERNAME_REGEX } from './username'

// Regras do dicionário de dados (secção 3. Técnicos). O email aplica-se ao email derivado do username.
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
// Só números móveis portugueses (91/92/93/96), +351 opcional. Valida-se sem espaços.
export const MOBILE_REGEX = /^(?:\+351)?9[1236]\d{7}$/

const ROLES_ALLOWED = new Set(STAFF_ROLE_OPTIONS.map((option) => option.value))
const SPECIALTIES = new Set(SPECIALTY_OPTIONS.map((option) => option.value))

/**
 * Valida a ficha do colaborador. Devolve { campo: mensagem }; vazio = válido.
 * Na criação (`isCreate`), o username é gerado a partir do nome e o email é derivado dele (D-16):
 * valida-se o username e se a base de email está configurada.
 */
export function validateStaff(form, { isCreate, username, email, emailBase }) {
  const errors = {}

  if (form.name.trim().length < 3) errors.name = 'O nome deve ter pelo menos 3 caracteres.'

  if (isCreate) {
    if (!emailBase) {
      errors.username =
        'VITE_STAFF_EMAIL_BASE não chegou à aplicação: confirme o nome da variável no .env.local, na pasta do projeto, e reinicie o npm run dev.'
    } else if (!EMAIL_BASE_REGEX.test(emailBase)) {
      errors.username = 'VITE_STAFF_EMAIL_BASE tem um formato inválido: use só um email simples (ex.: nome@gmail.com), sem "+" nem espaços.'
    } else if (!username || !USERNAME_REGEX.test(username)) {
      errors.username = 'Não foi possível gerar o nome de utilizador a partir do nome.'
    } else if (!email || !EMAIL_REGEX.test(email)) {
      errors.username = 'O email derivado não é válido.'
    }
  }

  const phone = form.phone.replace(/\s+/g, '')
  if (!phone) errors.phone = 'Indique o telemóvel.'
  else if (!MOBILE_REGEX.test(phone)) errors.phone = 'Telemóvel inválido: 9 dígitos começados por 91, 92, 93 ou 96 (+351 opcional).'

  if (!ROLES_ALLOWED.has(form.role)) errors.role = 'Escolha o perfil.'

  // Aptidões com pelo menos um elemento (dicionário de dados) — obrigatório para técnicos.
  if (form.role === ROLES.TECHNICIAN && form.specialties.length === 0) {
    errors.specialties = 'Selecione pelo menos uma especialidade.'
  }
  if (form.specialties.some((value) => !SPECIALTIES.has(value))) {
    errors.specialties = 'Há especialidades inválidas selecionadas.'
  }

  return errors
}
