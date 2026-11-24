import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  startAfter,
  updateDoc,
  where,
  addDoc,
} from 'firebase/firestore'
import { db } from '../config/firebase'

const CLIENTS = 'clients'
const POOLS = 'pools'
const APPOINTMENTS = 'appointments'
const POOL_READINGS = 'pool_readings'
// Documento com o contador do número sequencial de cliente (campo novo — validar com a equipa Android).
const COUNTERS_DOC = ['settings', 'counters']

export const CLIENTS_PAGE_SIZE = 20
const SEARCH_LIMIT = 20
// O operador `in` do Firestore aceita no máximo 30 valores.
const IN_QUERY_MAX = 30

function normalize(snapshot) {
  return { id: snapshot.id, ...snapshot.data() }
}

// ---------------------------------------------------------------------------
// Clientes
// ---------------------------------------------------------------------------

/**
 * Lê uma página de clientes, do mais recente para o mais antigo (paginação por cursor, RNF-WEB02).
 * `status`: 'all' | 'active' | 'inactive'. O filtro por estado com orderBy exige um índice composto
 * (is_active + created_at) criado na consola do Firestore.
 * Devolve { items, cursor, hasMore }; `cursor` é o último documento lido e serve para a página seguinte.
 */
export async function listClientsPage({ status = 'all', cursor = null } = {}) {
  const constraints = []
  if (status !== 'all') constraints.push(where('is_active', '==', status === 'active'))
  constraints.push(orderBy('created_at', 'desc'))
  if (cursor) constraints.push(startAfter(cursor))
  constraints.push(limit(CLIENTS_PAGE_SIZE))

  const snapshot = await getDocs(query(collection(db, CLIENTS), ...constraints))
  const docs = snapshot.docs
  return {
    items: docs.map(normalize),
    cursor: docs.length > 0 ? docs[docs.length - 1] : cursor,
    hasMore: docs.length === CLIENTS_PAGE_SIZE,
  }
}

/**
 * Pesquisa no servidor conforme o tipo de termo (já normalizado pelo domínio):
 * - `email`: prefixo no email (guardado em minúsculas);
 * - `nif`: igualdade no NIF; `phone`: igualdade no telefone (com e sem +351);
 * - `number`: igualdade no número sequencial de cliente;
 * - `name`: prefixo em `name_lower` (minúsculas sem acentos).
 * Os clientes criados sem `name_lower`/`client_number` (ex.: pela App Cliente) não aparecem nessas pesquisas.
 */
export async function searchClients({ kind, value }) {
  const ref = collection(db, CLIENTS)
  const prefixQuery = (field) =>
    query(ref, where(field, '>=', value), where(field, '<=', `${value}`), orderBy(field), limit(SEARCH_LIMIT))

  let queries
  switch (kind) {
    case 'email':
      queries = [prefixQuery('email')]
      break
    case 'name':
      queries = [prefixQuery('name_lower')]
      break
    case 'number':
      queries = [query(ref, where('client_number', '==', Number(value)), limit(1))]
      break
    case 'digits':
      // 9 dígitos tanto pode ser NIF como telefone: as duas pesquisas correm em paralelo.
      queries = [
        query(ref, where('nif', '==', value), limit(SEARCH_LIMIT)),
        query(ref, where('phone', 'in', [value, `+351${value}`]), limit(SEARCH_LIMIT)),
      ]
      break
    case 'phone':
      queries = [query(ref, where('phone', '==', value), limit(SEARCH_LIMIT))]
      break
    default:
      return []
  }

  const snapshots = await Promise.all(queries.map((q) => getDocs(q)))
  const byId = new Map()
  snapshots.forEach((snapshot) => snapshot.docs.forEach((d) => byId.set(d.id, normalize(d))))
  return [...byId.values()]
}

export async function getClient(clientId) {
  const snapshot = await getDoc(doc(db, CLIENTS, clientId))
  return snapshot.exists() ? normalize(snapshot) : null
}

/** Totais para os cartões do topo (agregação: 1 leitura por cada 1000 documentos contados). */
export async function countActiveClientsAndPools() {
  const [clients, pools] = await Promise.all([
    getCountFromServer(query(collection(db, CLIENTS), where('is_active', '==', true))),
    getCountFromServer(query(collection(db, POOLS), where('is_active', '==', true))),
  ])
  return { clients: clients.data().count, pools: pools.data().count }
}

/**
 * Email único (US01). O Firestore não tem restrições de unicidade, por isso a verificação é feita
 * antes de gravar; `excludeId` permite editar o próprio cliente sem dar conflito consigo mesmo.
 */
export async function isClientEmailTaken(email, excludeId = null) {
  const snapshot = await getDocs(query(collection(db, CLIENTS), where('email', '==', email), limit(2)))
  return snapshot.docs.some((d) => d.id !== excludeId)
}

/** Maior número de cliente já atribuído; só é usado se o contador ainda não existir. */
async function getHighestClientNumber() {
  const snapshot = await getDocs(
    query(collection(db, CLIENTS), orderBy('client_number', 'desc'), limit(1)),
  )
  if (snapshot.empty) return 0
  return Number(snapshot.docs[0].data().client_number) || 0
}

/**
 * Cria o cliente com o próximo número sequencial (`client_number`).
 * O contador `settings/counters.last_client_number` é lido e incrementado na mesma transação em que o
 * cliente é gravado, para dois administradores em simultâneo nunca receberem o mesmo número.
 * O cliente fica com `user_id: null`: a App Cliente associa a conta quando o cliente se registar com o mesmo email.
 */
export async function createClient(payload) {
  const counterRef = doc(db, ...COUNTERS_DOC)
  const clientRef = doc(collection(db, CLIENTS))
  const fallbackLast = await getHighestClientNumber()

  const clientNumber = await runTransaction(db, async (transaction) => {
    const counterSnap = await transaction.get(counterRef)
    const last = counterSnap.exists()
      ? Number(counterSnap.data().last_client_number) || 0
      : fallbackLast
    const next = last + 1

    transaction.set(counterRef, { last_client_number: next, updated_at: serverTimestamp() }, { merge: true })
    transaction.set(clientRef, {
      ...payload,
      client_number: next,
      user_id: null,
      is_active: true,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    })
    return next
  })

  // Os timestamps só existem no servidor depois da escrita; para a UI basta a data local aproximada.
  return { id: clientRef.id, ...payload, client_number: clientNumber, user_id: null, is_active: true }
}

export async function updateClient(clientId, payload) {
  await updateDoc(doc(db, CLIENTS, clientId), { ...payload, updated_at: serverTimestamp() })
}

/** Soft delete: o cliente nunca é apagado, para não deixar piscinas, agendamentos e pedidos órfãos. */
export async function setClientActive(clientId, isActive) {
  await updateDoc(doc(db, CLIENTS, clientId), { is_active: isActive, updated_at: serverTimestamp() })
}

// ---------------------------------------------------------------------------
// Piscinas
// ---------------------------------------------------------------------------

export async function listPoolsByClient(clientId) {
  const snapshot = await getDocs(query(collection(db, POOLS), where('client_id', '==', clientId)))
  return snapshot.docs.map(normalize)
}

/** Piscinas de vários clientes numa só leitura por lote (para a coluna "Piscinas" da lista). */
export async function listPoolsByClientIds(clientIds) {
  const unique = [...new Set(clientIds)]
  if (unique.length === 0) return []
  const chunks = []
  for (let i = 0; i < unique.length; i += IN_QUERY_MAX) chunks.push(unique.slice(i, i + IN_QUERY_MAX))
  const snapshots = await Promise.all(
    chunks.map((ids) => getDocs(query(collection(db, POOLS), where('client_id', 'in', ids)))),
  )
  return snapshots.flatMap((snapshot) => snapshot.docs.map(normalize))
}

export async function createPool(clientId, payload) {
  const data = {
    ...payload,
    client_id: clientId,
    is_active: true,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  }
  const ref = await addDoc(collection(db, POOLS), data)
  return { id: ref.id, ...payload, client_id: clientId, is_active: true }
}

export async function updatePool(poolId, payload) {
  await updateDoc(doc(db, POOLS, poolId), { ...payload, updated_at: serverTimestamp() })
}

export async function setPoolActive(poolId, isActive) {
  await updateDoc(doc(db, POOLS, poolId), { is_active: isActive, updated_at: serverTimestamp() })
}

// ---------------------------------------------------------------------------
// Atividade da piscina (só leitura: appointments e pool_readings pertencem a outros módulos)
// ---------------------------------------------------------------------------

/**
 * Últimos agendamentos da piscina, do mais recente para o mais antigo. Como a ordem é descendente,
 * os agendamentos futuros aparecem primeiro, o que permite tirar daqui a próxima visita sem outra query.
 * Exige o índice composto pool_id + date (desc).
 */
export async function listRecentAppointmentsByPool(poolId, max = 10) {
  const snapshot = await getDocs(
    query(collection(db, APPOINTMENTS), where('pool_id', '==', poolId), orderBy('date', 'desc'), limit(max)),
  )
  return snapshot.docs.map(normalize)
}

/** Última leitura físico-química da piscina. Exige o índice composto pool_id + timestamp (desc). */
export async function getLatestPoolReading(poolId) {
  const snapshot = await getDocs(
    query(collection(db, POOL_READINGS), where('pool_id', '==', poolId), orderBy('timestamp', 'desc'), limit(1)),
  )
  return snapshot.empty ? null : normalize(snapshot.docs[0])
}
