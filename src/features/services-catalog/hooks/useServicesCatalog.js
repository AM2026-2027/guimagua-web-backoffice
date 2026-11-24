import { useCallback, useEffect, useState } from 'react'
import {
  createService,
  getAllServices,
  updateService,
} from '../../../services/servicesCatalogService'

const LOAD_ERROR = 'Não foi possível carregar o catálogo. Tente novamente.'

/**
 * Catálogo de serviços: lista pequena, lida uma vez (sem subscrição) e mantida em memória.
 * Depois de cada escrita o estado local é atualizado sem voltar a ler a coleção (quotas gratuitas).
 */
export default function useServicesCatalog() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // Ids dos serviços com uma alteração de estado em curso (evita cliques repetidos no interruptor).
  const [pendingIds, setPendingIds] = useState([])
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let ignore = false
    async function loadServices() {
      setLoading(true)
      setError('')
      try {
        const items = await getAllServices()
        if (!ignore) setServices(items)
      } catch {
        if (!ignore) setError(LOAD_ERROR)
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    loadServices()
    // Limpeza: ignora a resposta se o componente for desmontado ou se houver um novo pedido.
    return () => {
      ignore = true
    }
  }, [reloadKey])

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  /**
   * Cria (serviceId nulo) ou atualiza um serviço. Devolve true/false; a mensagem de erro
   * é mostrada pelo próprio formulário, que fica aberto com os dados preenchidos (RNF-GLB03).
   */
  const saveService = useCallback(async (serviceId, payload) => {
    try {
      if (serviceId) {
        await updateService(serviceId, payload)
        setServices((previous) => previous.map((item) => (
          item.id === serviceId ? { ...item, ...payload } : item
        )))
      } else {
        const id = await createService(payload)
        setServices((previous) => [...previous, { id, ...payload }])
      }
      return true
    } catch {
      return false
    }
  }, [])

  /** Alterna `is_active`. Os serviços nunca se apagam: a app e o histórico continuam a referenciá-los. */
  const toggleServiceActive = useCallback(async (service) => {
    const isActive = service.is_active === false
    setError('')
    setPendingIds((previous) => [...previous, service.id])
    try {
      await updateService(service.id, { is_active: isActive })
      setServices((previous) => previous.map((item) => (
        item.id === service.id ? { ...item, is_active: isActive } : item
      )))
      return true
    } catch {
      setError(`Não foi possível ${isActive ? 'ativar' : 'desativar'} o serviço "${service.name}".`)
      return false
    } finally {
      setPendingIds((previous) => previous.filter((id) => id !== service.id))
    }
  }, [])

  const clearError = useCallback(() => setError(''), [])

  return { services, loading, error, clearError, reload, pendingIds, saveService, toggleServiceActive }
}
