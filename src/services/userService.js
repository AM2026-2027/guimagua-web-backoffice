import { createUserWithEmailAndPassword, sendPasswordResetEmail, signOut } from 'firebase/auth'
import {
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { auth, db, secondaryAuth } from '../config/firebase'

const USERS = 'users'
const APPOINTMENTS = 'appointments'
// Roles geridos no módulo team: técnicos e comerciais, que usam a App Guimágua. O backoffice tem uma única
// conta admin, que não é gerida aqui, e os clientes têm contas criadas pela App Cliente.
const STAFF_ROLES = ['technician', 'commercial']

export const PROFILE_SAVE_FAILED = 'team/profile-save-failed'

/**
 * Base dos emails das contas da equipa (D-16), definida em `VITE_STAFF_EMAIL_BASE` no `.env.local`
 * (ex.: um Gmail da empresa). O email de cada conta é <local>+<username>@<domínio>; a App Guimágua usa a mesma base.
 */
export function getStaffEmailBase() {
  // Tolera aspas e espaços à volta do valor (ex.: VITE_STAFF_EMAIL_BASE=" nome@gmail.com ").
  return String(import.meta.env.VITE_STAFF_EMAIL_BASE ?? '').trim().replace(/^['"]|['"]$/g, '').trim()
}

function normalize(snapshot) {
  return { id: snapshot.id, ...snapshot.data() }
}

/**
 * Lê o perfil do utilizador em `users/{uid}`.
 * Esquema (partilhado com a App Android): { name, email, role, is_active }
 * Roles: 'admin' | 'client' | 'technician' | 'commercial'
 */
export async function getUserProfile(uid) {
  const snapshot = await getDoc(doc(db, USERS, uid))
  if (!snapshot.exists()) return null
  const data = snapshot.data()
  return {
    id: snapshot.id,
    ...data,
    role: typeof data.role === 'string' ? data.role.trim().toLowerCase() : null,
  }
}

// ---------------------------------------------------------------------------
// Equipa (módulo team)
// ---------------------------------------------------------------------------

/** Técnicos e comerciais: lista pequena, lida uma vez e filtrada/ordenada no cliente (D-05). */
export async function listStaffUsers() {
  const snapshot = await getDocs(query(collection(db, USERS), where('role', 'in', STAFF_ROLES)))
  return snapshot.docs.map(normalize)
}

/**
 * Palavra-passe temporária aleatória: gerada com crypto.getRandomValues e devolvida UMA vez à UI, para o
 * admin a passar ao colaborador. Nunca é guardada no Firestore. Formato legível para ditar ou escrever
 * (sem caracteres ambíguos como 0/O ou 1/l), ex.: "Kp7m-Xw3q-Hn9t", com maiúsculas, minúsculas e dígitos.
 */
function generateTemporaryPassword() {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  for (;;) {
    const values = new Uint32Array(12)
    crypto.getRandomValues(values)
    const raw = Array.from(values, (value) => alphabet[value % alphabet.length]).join('')
    if (/[A-Z]/.test(raw) && /[a-z]/.test(raw) && /\d/.test(raw)) {
      return `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`
    }
  }
}

/**
 * Grava (ou volta a gravar) o documento `users/{uid}` de um colaborador novo.
 * `must_change_password: true` obriga a App a pedir uma palavra-passe nova no primeiro início de sessão.
 */
export async function saveStaffProfile(uid, payload) {
  const data = { ...payload, is_active: true, must_change_password: true }
  await setDoc(doc(db, USERS, uid), { ...data, created_at: serverTimestamp(), updated_at: serverTimestamp() })
  return { id: uid, ...data }
}

/**
 * Cria a conta de um técnico ou comercial:
 * 1. conta no Firebase Auth através da instância secundária, para não terminar a sessão do admin (D-08);
 * 2. signOut da instância secundária;
 * 3. documento `users/{uid}` com `must_change_password: true`, gravado com a sessão do admin.
 * Devolve `{ profile, temporaryPassword }`: a palavra-passe é mostrada uma única vez ao admin.
 * Se o passo 3 falhar, lança um erro com `code = PROFILE_SAVE_FAILED`, `uid` e `temporaryPassword`,
 * para a UI repetir só a gravação sem perder a palavra-passe já definida na conta.
 */
export async function createStaffAccount(payload) {
  const temporaryPassword = generateTemporaryPassword()
  let uid
  try {
    const credential = await createUserWithEmailAndPassword(secondaryAuth, payload.email, temporaryPassword)
    uid = credential.user.uid
  } finally {
    // Limpeza: a instância secundária nunca fica com sessão iniciada.
    await signOut(secondaryAuth).catch(() => {})
  }

  try {
    const profile = await saveStaffProfile(uid, payload)
    return { profile, temporaryPassword }
  } catch (cause) {
    const error = new Error('A conta foi criada, mas o perfil não foi gravado.')
    error.code = PROFILE_SAVE_FAILED
    error.uid = uid
    error.temporaryPassword = temporaryPassword
    error.cause = cause
    throw error
  }
}

/**
 * Reposição da palavra-passe sem Admin SDK e sem custos: o Firebase envia o link para o email da conta
 * (email da empresa, a que a Guimágua tem acesso). O admin abre o link, define uma palavra-passe genérica
 * e passa-a ao colaborador; `must_change_password: true` obriga a App a pedir uma nova no início de sessão seguinte.
 * O email é enviado primeiro: se falhar, o perfil não é marcado.
 */
export async function requestStaffPasswordReset(uid, email) {
  await sendPasswordResetEmail(auth, email)
  await updateDoc(doc(db, USERS, uid), { must_change_password: true, updated_at: serverTimestamp() })
}

/** Atualiza o perfil (o email não muda: está ligado ao Firebase Auth e só o Admin SDK o poderia alterar). */
export async function updateStaffUser(uid, payload) {
  await updateDoc(doc(db, USERS, uid), { ...payload, updated_at: serverTimestamp() })
}

/** Retirar o acesso = `is_active: false` (sem o Admin SDK não é possível apagar contas do Auth, D-08). */
export async function setUserActive(uid, isActive) {
  await updateDoc(doc(db, USERS, uid), { is_active: isActive, updated_at: serverTimestamp() })
}

/** Agendamentos num intervalo [start, end) (ms), para a atividade de hoje da equipa. Só leitura. */
export async function listAppointmentsBetween(startMs, endMs) {
  const snapshot = await getDocs(
    query(
      collection(db, APPOINTMENTS),
      where('date', '>=', Timestamp.fromMillis(startMs)),
      where('date', '<', Timestamp.fromMillis(endMs)),
    ),
  )
  return snapshot.docs.map(normalize)
}
