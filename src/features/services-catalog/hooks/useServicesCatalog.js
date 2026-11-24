import { useCallback, useEffect, useState } from 'react'
import {
  createService,
  getAllServices,
  updateService,
} from '../../../services/servicesCatalogService'

export default function useServicesCatalog() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const items = await getAllServices()
      setServices(items)
    } catch {
      setError('Não foi possível carregar o catálogo. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let ignore = false
    async function loadServices() {
      try {
        const items = await getAllServices()
        if (!ignore) setServices(items)
      } catch {
        if (!ignore) setError('Não foi possível carregar o catálogo. Tente novamente.')
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    loadServices()
    return () => {
      ignore = true
    }
  }, [])

  const saveService = useCallback(async (serviceId, payload) => {
    setError('')
    try {
      if (serviceId) {
        await updateService(serviceId, payload)
        setServices((previous) => previous.map((item) => (
          item.id === serviceId ? { ...item, ...payload } : item
        )))
      } else {
        await createService(payload)
        await refresh()
      }
      return true
    } catch {
      setError('Não foi possível guardar o serviço. Verifique a ligação e tente novamente.')
      return false
    }
  }, [refresh])

  const setServiceActive = useCallback(async (service) => {
    const isActive = service.is_active === false
    try {
      await updateService(service.id, { is_active: isActive })
      setServices((previous) => previous.map((item) => (
        item.id === service.id ? { ...item, is_active: isActive } : item
      )))
      return true
    } catch {
      setError('Não foi possível alterar o estado do serviço.')
      return false
    }
  }, [])

  return { services, loading, error, setError, refresh, saveService, setServiceActive }
}
