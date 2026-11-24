import { useCallback, useEffect, useRef, useState } from 'react'
import {
  getConsumablesByIds,
  listConsumablesPage,
} from '../../../services/servicesCatalogService'

const LOAD_ERROR = 'Não foi possível carregar os consumíveis.'

/**
 * Consumíveis usados pelo catálogo (só leitura; geridos no módulo inventory).
 * - `referencedIds`: produtos obrigatórios dos serviços. São lidos sempre pelo id (poucos documentos),
 *   para a lista mostrar o nome e o semáforo de stock de cada artigo.
 * - `pagesEnabled`: com o formulário aberto, lê também a lista completa por páginas (`loadMore`),
 *   para escolher novos produtos. A lista cresce, por isso nunca se lê de uma só vez (RNF-WEB02).
 * O resultado fica guardado em memória para as aberturas seguintes do formulário.
 */
export default function useConsumables(pagesEnabled, referencedIds) {
  const [items, setItems] = useState([])
  const [cursor, setCursor] = useState(null)
  const [hasMore, setHasMore] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  // Ids pedidos que não existem em `consumables` (apagados ou inválidos), para a UI o indicar.
  const [notFoundIds, setNotFoundIds] = useState([])
  // Ids já pedidos ao Firestore; é uma ref para não reler os mesmos documentos nem recriar efeitos.
  const requestedIdsRef = useRef(new Set())

  // Chave estável para o efeito: um array novo com os mesmos ids não deve voltar a disparar a leitura.
  const referencedKey = [...new Set(referencedIds)].sort().join(',')

  // Os pedidos não são cancelados quando o formulário fecha ou os ids mudam: os dados continuam
  // válidos e ficam em cache. Só se ignoram as respostas que chegam depois de a página sair.
  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    // Limpeza: marca a página como desmontada.
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (!pagesEnabled || loaded) return
    async function loadFirstPage() {
      setLoading(true)
      setError('')
      try {
        const page = await listConsumablesPage()
        if (!mountedRef.current) return
        page.items.forEach((item) => requestedIdsRef.current.add(item.id))
        setItems((previous) => mergeById(previous, page.items))
        setCursor(page.cursor)
        setHasMore(page.hasMore)
        setLoaded(true)
      } catch {
        if (mountedRef.current) setError(LOAD_ERROR)
      } finally {
        if (mountedRef.current) setLoading(false)
      }
    }
    loadFirstPage()
  }, [pagesEnabled, loaded])

  useEffect(() => {
    if (!referencedKey) return
    const missingIds = referencedKey.split(',').filter((id) => !requestedIdsRef.current.has(id))
    if (missingIds.length === 0) return
    missingIds.forEach((id) => requestedIdsRef.current.add(id))
    getConsumablesByIds(missingIds)
      .then((found) => {
        if (!mountedRef.current) return
        setItems((previous) => mergeById(previous, found))
        const foundIds = new Set(found.map((item) => item.id))
        const absent = missingIds.filter((id) => !foundIds.has(id))
        if (absent.length > 0) setNotFoundIds((previous) => [...previous, ...absent])
      })
      .catch(() => {
        // Permite tentar de novo quando a lista de ids mudar.
        missingIds.forEach((id) => requestedIdsRef.current.delete(id))
        if (mountedRef.current) setError(LOAD_ERROR)
      })
  }, [referencedKey])

  const loadMore = useCallback(async () => {
    if (!cursor || loading) return false
    setLoading(true)
    setError('')
    try {
      const page = await listConsumablesPage({ cursor })
      page.items.forEach((item) => requestedIdsRef.current.add(item.id))
      setItems((previous) => mergeById(previous, page.items))
      setCursor(page.cursor)
      setHasMore(page.hasMore)
      return true
    } catch {
      setError(LOAD_ERROR)
      return false
    } finally {
      setLoading(false)
    }
  }, [cursor, loading])

  return { consumables: items, notFoundIds, hasMore, loading, error, loadMore }
}

// Junta listas sem duplicar documentos (o mesmo consumível pode chegar por página e por id).
function mergeById(previous, incoming) {
  const known = new Set(previous.map((item) => item.id))
  return [...previous, ...incoming.filter((item) => !known.has(item.id))]
}
