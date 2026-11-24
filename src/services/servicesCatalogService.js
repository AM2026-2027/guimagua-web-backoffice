import {
  addDoc,
  collection,
  doc,
  documentId,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../config/firebase'

// Coleção oficial do catálogo (docs/modelo-dados.md); a spec antiga falava em `services_catalog`.
const SERVICES = 'services'
const CONSUMABLES = 'consumables'

export const CONSUMABLES_PAGE_SIZE = 50
// O operador `in` do Firestore aceita no máximo 30 valores.
const IN_QUERY_MAX = 30

function normalize(snapshot) {
  return { id: snapshot.id, ...snapshot.data() }
}

// ---------------------------------------------------------------------------
// Serviços (catálogo pequeno: lido uma vez e filtrado/ordenado no cliente)
// ---------------------------------------------------------------------------

export async function getAllServices() {
  const snapshot = await getDocs(collection(db, SERVICES))
  return snapshot.docs.map(normalize)
}

/** Cria um serviço e devolve o id do documento novo. */
export async function createService(payload) {
  const reference = await addDoc(collection(db, SERVICES), {
    ...payload,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  })
  return reference.id
}

export async function updateService(id, payload) {
  await updateDoc(doc(db, SERVICES, id), {
    ...payload,
    updated_at: serverTimestamp(),
  })
}

// ---------------------------------------------------------------------------
// Consumíveis (só leitura: são geridos no módulo inventory)
// ---------------------------------------------------------------------------

/**
 * Lê uma página de consumíveis por ordem alfabética (paginação por cursor, RNF-WEB02).
 * Não se filtra `is_active` na query para não exigir um índice composto (is_active + name);
 * os inativos são escondidos no cliente.
 * Devolve { items, cursor, hasMore }; `cursor` é o último documento lido.
 */
export async function listConsumablesPage({ cursor = null } = {}) {
  const constraints = [orderBy('name')]
  if (cursor) constraints.push(startAfter(cursor))
  constraints.push(limit(CONSUMABLES_PAGE_SIZE))

  const snapshot = await getDocs(query(collection(db, CONSUMABLES), ...constraints))
  const docs = snapshot.docs
  return {
    items: docs.map(normalize),
    cursor: docs.length > 0 ? docs[docs.length - 1] : cursor,
    hasMore: docs.length === CONSUMABLES_PAGE_SIZE,
  }
}

/** Lê consumíveis pelo id (para mostrar os produtos obrigatórios que ainda não foram carregados). */
export async function getConsumablesByIds(ids) {
  const uniqueIds = [...new Set(ids)]
  const chunks = []
  for (let index = 0; index < uniqueIds.length; index += IN_QUERY_MAX) {
    chunks.push(uniqueIds.slice(index, index + IN_QUERY_MAX))
  }
  const snapshots = await Promise.all(
    chunks.map((chunk) => getDocs(query(collection(db, CONSUMABLES), where(documentId(), 'in', chunk)))),
  )
  return snapshots.flatMap((snapshot) => snapshot.docs.map(normalize))
}
