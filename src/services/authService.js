import {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from 'firebase/auth'
import { auth } from '../config/firebase'

export async function loginWithEmail(email, password, rememberSession = true) {
  await setPersistence(auth, rememberSession ? browserLocalPersistence : browserSessionPersistence)
  const credential = await signInWithEmailAndPassword(auth, email, password)
  return credential.user
}

export function logout() {
  return signOut(auth)
}

export function resetPassword(email) {
  return sendPasswordResetEmail(auth, email)
}

export function subscribeToAuthChanges(callback) {
  return onAuthStateChanged(auth, callback)
}
