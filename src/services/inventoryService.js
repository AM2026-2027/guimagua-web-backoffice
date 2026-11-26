import {
  collection,
  doc,
  getCountFromServer,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  startAfter,
  updateDoc,
  where,
} from 'firebase/firestore'
import { auth, db } from '../config/firebase'

const CONSUMABLES = 'consumables'
const APPOINTMENTS = 'appointments'
const SERVICES = 'services'
// Registo imutável de entradas e saídas de stock (coleção nova — validar com a equipa Android).
// Serve de base ao histórico e aos relatórios (RF-WEB07).
const STOCK_MOVEMENTS = 'stock_movements'
// Contadores sequenciais partilhados (já usado para o número de cliente). Um campo por categoria:
// `last_sku_<categoria>` — campo novo, validar com a equipa Android.
const COUNTERS_DOC = ['settings', 'counters']

export const CONSUMABLES_PAGE_SIZE = 25
// Estados de agendamento que comprometem stock (D-10).
const COMMITTING_STATUSES = ['scheduled', 'in_progress']

export const NEGATIVE_STOCK = 'inventory/negative-stock'

/**
 * Documento de movimento de stock. `type`: 'in' (entrada) | 'out' (saída); `quantity` é sempre positiva.
 * `source`: 'initial_stock' (criação do artigo) | 'manual_adjustment' (ajuste no backoffice); a App poderá
 * acrescentar, por exemplo, 'appointment' ao abater stock numa intervenção (D-10).
 * Guarda nome e SKU do artigo no momento do movimento, para o histórico não depender de leituras extra.
 */
function movementData({ consumableId, sku, name, unit, type, quantity, before, after, source, reason }) {
  return {
    consumable_id: consumableId,
    consumable_sku: sku ?? null,
    consumable_name: name ?? null,
    unit: unit ?? null,
    type,
    quantity,
    stock_before: before,
    stock_after: after,
    source,
    reason: reason || null,
    created_by: auth.currentUser?.uid ?? null,
    created_at: serverTimestamp(),
  }
}

function normalize(snapshot) {
  return { id: snapshot.id, ...snapshot.data() }
}

/**
 * Página de consumíveis por ordem alfabética (paginação por cursor, RNF-WEB02).
 * Os inativos não são filtrados na query, para não exigir um índice composto (is_active + name);
 * a UI esconde-os, com a opção "ver artigos inativos" (US03).
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

/** Procura exata por SKU (para a pesquisa encontrar artigos ainda não carregados). */
export async function findConsumablesBySku(sku) {
  const snapshot = await getDocs(query(collection(db, CONSUMABLES), where('sku', '==', sku), limit(5)))
  return snapshot.docs.map(normalize)
}

/** Total de artigos ativos (agregação: 1 leitura por cada 1000 documentos). */
export async function countActiveConsumables() {
  const snapshot = await getCountFromServer(query(collection(db, CONSUMABLES), where('is_active', '==', true)))
  return snapshot.data().count
}

/** Maior número de SKU já usado com um prefixo (ex.: "QUI-0007" → 7). Só é usado se o contador ainda não existir. */
async function getHighestSkuNumber(prefix) {
  const snapshot = await getDocs(
    query(
      collection(db, CONSUMABLES),
      where('sku', '>=', `${prefix}-`),
      where('sku', '<=', `${prefix}-`),
      orderBy('sku', 'desc'),
      limit(1),
    ),
  )
  if (snapshot.empty) return 0
  const match = String(snapshot.docs[0].data().sku).match(/-(\d+)$/)
  return match ? Number(match[1]) : 0
}

/**
 * Cria um artigo com SKU automático da categoria: <PREFIXO>-<número com 4 dígitos> (ex.: QUI-0001).
 * O contador `settings/counters.last_sku_<categoria>` é lido e incrementado na mesma transação em que o
 * artigo é gravado, para dois administradores nunca receberem o mesmo SKU.
 * O stock projetado começa igual ao físico (ainda não há agendamentos a comprometer o artigo, D-10).
 * Se o stock inicial for maior que 0, regista também o movimento de entrada 'initial_stock' na mesma transação.
 */
export async function createConsumable(payload, skuPrefix) {
  const counterField = `last_sku_${payload.category}`
  const counterRef = doc(db, ...COUNTERS_DOC)
  const consumableRef = doc(collection(db, CONSUMABLES))
  const fallbackLast = await getHighestSkuNumber(skuPrefix)

  const sku = await runTransaction(db, async (transaction) => {
    const counterSnap = await transaction.get(counterRef)
    const stored = counterSnap.exists() ? Number(counterSnap.data()[counterField]) : NaN
    const next = (Number.isFinite(stored) ? stored : fallbackLast) + 1
    const generated = `${skuPrefix}-${String(next).padStart(4, '0')}`

    transaction.set(counterRef, { [counterField]: next, updated_at: serverTimestamp() }, { merge: true })
    transaction.set(consumableRef, {
      ...payload,
      sku: generated,
      projected_stock: payload.stock_quantity,
      is_active: true,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    })
    if (payload.stock_quantity > 0) {
      transaction.set(
        doc(collection(db, STOCK_MOVEMENTS)),
        movementData({
          consumableId: consumableRef.id,
          sku: generated,
          name: payload.name,
          unit: payload.unit,
          type: 'in',
          quantity: payload.stock_quantity,
          before: 0,
          after: payload.stock_quantity,
          source: 'initial_stock',
          reason: 'Stock inicial',
        }),
      )
    }
    return generated
  })

  return { id: consumableRef.id, ...payload, sku, projected_stock: payload.stock_quantity, is_active: true }
}

/** Atualiza os dados do artigo (o SKU e o stock não mudam aqui). */
export async function updateConsumable(id, payload) {
  await updateDoc(doc(db, CONSUMABLES, id), { ...payload, updated_at: serverTimestamp() })
}

/**
 * Entrada (+) ou saída (−) de stock físico. Usa `increment` no stock físico e no projetado, para ficar
 * coerente com a agenda, que também atualiza `projected_stock` (D-10), mesmo com escritas em simultâneo.
 * Na mesma transação regista o movimento em `stock_movements` (ou tudo é gravado, ou nada é).
 * Lança `NEGATIVE_STOCK` se a saída deixasse o stock físico negativo (dicionário de dados: stock ≥ 0).
 * Devolve os valores depois do ajuste.
 */
export async function adjustConsumableStock(id, delta, reason = '') {
  const ref = doc(db, CONSUMABLES, id)
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref)
    const data = snapshot.data() ?? {}
    const current = Number(data.stock_quantity) || 0
    const projected = Number.isFinite(Number(data.projected_stock)) ? Number(data.projected_stock) : current
    if (current + delta < 0) {
      const error = new Error('O stock físico não pode ficar negativo.')
      error.code = NEGATIVE_STOCK
      throw error
    }
    transaction.update(ref, {
      stock_quantity: increment(delta),
      projected_stock: increment(delta),
      updated_at: serverTimestamp(),
    })
    transaction.set(
      doc(collection(db, STOCK_MOVEMENTS)),
      movementData({
        consumableId: id,
        sku: data.sku,
        name: data.name,
        unit: data.unit,
        type: delta > 0 ? 'in' : 'out',
        quantity: Math.abs(delta),
        before: current,
        after: current + delta,
        source: 'manual_adjustment',
        reason: reason.trim(),
      }),
    )
    return { stock_quantity: current + delta, projected_stock: projected + delta }
  })
}

/** Inativação segura: o artigo nunca é apagado, para manter o histórico (D-10, US03). */
export async function setConsumableActive(id, isActive) {
  await updateDoc(doc(db, CONSUMABLES, id), { is_active: isActive, updated_at: serverTimestamp() })
}

// ---------------------------------------------------------------------------
// Stock comprometido (só leitura de outros módulos, D-10)
// ---------------------------------------------------------------------------

/** Agendamentos que comprometem stock: estado `scheduled` ou `in_progress`. */
export async function listCommittingAppointments() {
  const snapshot = await getDocs(query(collection(db, APPOINTMENTS), where('status', 'in', COMMITTING_STATUSES)))
  return snapshot.docs.map(normalize)
}

/** Catálogo de serviços (lista pequena), para saber os `base_consumables` de cada agendamento. */
export async function listServicesForStock() {
  const snapshot = await getDocs(collection(db, SERVICES))
  return snapshot.docs.map(normalize)
}
