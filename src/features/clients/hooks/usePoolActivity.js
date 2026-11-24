import { useEffect, useState } from 'react'
import { getLatestPoolReading, listRecentAppointmentsByPool } from '../../../services/clientsService'
import { getClientsErrorMessage } from '../utils/errors'

const EMPTY_ACTIVITY = { key: null, appointments: [], reading: null, fetchedAt: 0, error: '' }

/**
 * Atividade da piscina selecionada (só leitura): últimos agendamentos e última leitura físico-química.
 * `fetchedAt` é o momento da leitura e serve de "agora" para separar visitas futuras e passadas
 * sem chamar Date.now() durante a renderização.
 */
export function usePoolActivity(poolId) {
  const [activity, setActivity] = useState(EMPTY_ACTIVITY)

  useEffect(() => {
    if (!poolId) return undefined
    let ignore = false
    async function load() {
      try {
        const [appointments, reading] = await Promise.all([
          listRecentAppointmentsByPool(poolId),
          getLatestPoolReading(poolId),
        ])
        if (!ignore) setActivity({ key: poolId, appointments, reading, fetchedAt: Date.now(), error: '' })
      } catch (error) {
        console.error(error)
        if (!ignore) {
          setActivity({
            ...EMPTY_ACTIVITY,
            key: poolId,
            error: getClientsErrorMessage(error, 'Não foi possível carregar a atividade da piscina.'),
          })
        }
      }
    }
    load()
    // Limpeza: ao trocar de separador, a resposta da piscina anterior é ignorada.
    return () => {
      ignore = true
    }
  }, [poolId])

  const loading = Boolean(poolId) && activity.key !== poolId
  return loading || !poolId ? { ...EMPTY_ACTIVITY, loading } : { ...activity, loading: false }
}
