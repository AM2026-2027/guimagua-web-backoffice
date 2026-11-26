import { useCallback, useEffect, useState } from 'react'
import {
  createPool as createPoolDoc,
  getClient,
  listPoolsByClient,
  setPoolActive as setPoolActiveDoc,
  updatePool as updatePoolDoc,
} from '../../../services/clientsService'
import { persistClientActive, persistClientUpdate } from './clientActions'
import { getClientsErrorMessage } from '../utils/errors'

const EMPTY_DETAIL = { key: null, client: null, pools: [], error: '' }

function replaceById(items, updated) {
  return items.map((item) => (item.id === updated.id ? updated : item))
}

/**
 * Ficha do cliente: dados do cliente, piscinas e respetivas operações (as operações devolvem true/false).
 * Callbacks opcionais para a página propagar as alterações à lista sem a voltar a ler:
 * `onClientSaved(client)`, `onPoolSaved(pool)` e `onCountsChange({ clients, inactiveClients, pools })`.
 */
export function useClientDetail(clientId, { onClientSaved, onPoolSaved, onCountsChange } = {}) {
  const [reloadToken, setReloadToken] = useState(0)
  const [detail, setDetail] = useState(EMPTY_DETAIL)
  const [actionError, setActionError] = useState('')

  const key = `${clientId}:${reloadToken}`

  useEffect(() => {
    if (!clientId) return undefined
    let ignore = false
    async function load() {
      try {
        const [client, pools] = await Promise.all([getClient(clientId), listPoolsByClient(clientId)])
        if (!ignore) setDetail({ key, client, pools, error: client ? '' : 'Cliente não encontrado.' })
      } catch (error) {
        console.error(error)
        if (!ignore) {
          setDetail({ ...EMPTY_DETAIL, key, error: getClientsErrorMessage(error, 'Não foi possível carregar o cliente.') })
        }
      }
    }
    load()
    // Limpeza: se o utilizador abrir outro cliente antes da resposta, a resposta antiga é ignorada.
    return () => {
      ignore = true
    }
  }, [clientId, key])

  const reload = useCallback(() => setReloadToken((token) => token + 1), [])

  async function run(action, fallbackMessage) {
    setActionError('')
    try {
      await action()
      return true
    } catch (error) {
      console.error(error)
      setActionError(getClientsErrorMessage(error, fallbackMessage))
      return false
    }
  }

  function updateClient(payload) {
    return run(async () => {
      const updated = await persistClientUpdate(detail.client, payload)
      setDetail((prev) => ({ ...prev, client: updated }))
      onClientSaved?.(updated)
    }, 'Não foi possível guardar as alterações.')
  }

  function setClientActive(isActive) {
    return run(async () => {
      const updated = await persistClientActive(detail.client, isActive)
      setDetail((prev) => ({ ...prev, client: updated }))
      onClientSaved?.(updated)
      onCountsChange?.({ clients: isActive ? 1 : -1, inactiveClients: isActive ? -1 : 1 })
    }, 'Não foi possível alterar o estado do cliente.')
  }

  /** `onCreated(pool)` permite à página selecionar a piscina nova. */
  function createPool(payload, onCreated) {
    return run(async () => {
      const pool = await createPoolDoc(clientId, payload)
      setDetail((prev) => ({ ...prev, pools: [...prev.pools, pool] }))
      onPoolSaved?.(pool)
      onCountsChange?.({ pools: 1 })
      onCreated?.(pool)
    }, 'Não foi possível criar a piscina.')
  }

  function updatePool(pool, payload) {
    return run(async () => {
      await updatePoolDoc(pool.id, payload)
      const updated = { ...pool, ...payload }
      setDetail((prev) => ({ ...prev, pools: replaceById(prev.pools, updated) }))
      onPoolSaved?.(updated)
    }, 'Não foi possível guardar a piscina.')
  }

  function setPoolActive(pool, isActive) {
    return run(async () => {
      await setPoolActiveDoc(pool.id, isActive)
      const updated = { ...pool, is_active: isActive }
      setDetail((prev) => ({ ...prev, pools: replaceById(prev.pools, updated) }))
      onPoolSaved?.(updated)
      onCountsChange?.({ pools: isActive ? 1 : -1 })
    }, 'Não foi possível alterar o estado da piscina.')
  }

  const loading = Boolean(clientId) && detail.key !== key

  return {
    client: loading ? null : detail.client,
    pools: loading ? [] : detail.pools,
    loading,
    error: loading ? '' : detail.error,
    reload,
    actionError,
    clearActionError: () => setActionError(''),
    updateClient,
    setClientActive,
    createPool,
    updatePool,
    setPoolActive,
  }
}
