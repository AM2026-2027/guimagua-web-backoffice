import { useEffect, useMemo, useState } from 'react'
import { listServices, listStaff } from '../../../services/reportsService'
import { getReportsErrorMessage } from '../utils/errors'

/**
 * Listas pequenas usadas por todos os separadores (técnicos/comerciais e serviços), lidas uma vez
 * por abertura do ecrã (D-05). Devolve também Maps por id para mostrar nomes sem leituras extra.
 */
export function useReferenceData() {
  const [state, setState] = useState({ loaded: false, staff: [], services: [], error: '' })

  useEffect(() => {
    let ignore = false
    Promise.all([listStaff(), listServices()])
      .then(([staff, services]) => {
        if (!ignore) setState({ loaded: true, staff, services, error: '' })
      })
      .catch((error) => {
        console.error(error)
        if (!ignore) setState({ loaded: true, staff: [], services: [], error: getReportsErrorMessage(error, 'Não foi possível carregar técnicos e serviços.') })
      })
    // Limpeza: ignora a resposta se o ecrã fechar antes de ela chegar.
    return () => {
      ignore = true
    }
  }, [])

  const staffById = useMemo(() => new Map(state.staff.map((user) => [user.id, user])), [state.staff])
  const servicesById = useMemo(() => new Map(state.services.map((service) => [service.id, service])), [state.services])
  const technicians = useMemo(
    () => state.staff.toSorted((a, b) => String(a.name ?? '').localeCompare(String(b.name ?? ''), 'pt-PT')),
    [state.staff],
  )

  return { loaded: state.loaded, error: state.error, technicians, staffById, servicesById }
}
