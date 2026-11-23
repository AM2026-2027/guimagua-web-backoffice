import { doc, getDoc } from 'firebase/firestore'
import { db } from '../config/firebase'

/**
 * Lê o perfil do utilizador em `users/{uid}`.
 * Esquema (partilhado com a App Android): { name, email, role, is_active }
 * Roles: 'admin' | 'client' | 'technician' | 'commercial'
 */
export async function getUserProfile(uid) {
  const snapshot = await getDoc(doc(db, 'users', uid))
  if (!snapshot.exists()) return null
  const data = snapshot.data()
  return {
    id: snapshot.id,
    ...data,
    role: typeof data.role === 'string' ? data.role.trim().toLowerCase() : null,
  }
}
