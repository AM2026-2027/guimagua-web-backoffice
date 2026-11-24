import {
  addDoc,
  collection,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../config/firebase'

const servicesCollection = collection(db, 'service_catalog')

function normalizeService(snapshot) {
  return { id: snapshot.id, ...snapshot.data() }
}

export async function getAllServices() {
  const snapshot = await getDocs(servicesCollection)
  return snapshot.docs.map(normalizeService)
}

export async function createService(payload) {
  const reference = await addDoc(servicesCollection, {
    ...payload,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  })
  return reference.id
}

export async function updateService(id, payload) {
  await updateDoc(doc(db, 'service_catalog', id), {
    ...payload,
    updated_at: serverTimestamp(),
  })
}
