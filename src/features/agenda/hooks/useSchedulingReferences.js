import { useEffect, useMemo, useState } from 'react'
import { listAgendaServices, listAgendaStaff } from '../../../services/agendaService'
import { getAgendaErrorMessage } from '../utils/errors'

const EMPTY = { loaded: false, staff: [], services: [], error: '' }

/**
 * Colaboradores (técnicos e comerciais) e catálogo de serviços para a janela de novo agendamento,
 * quando ela é aberta fora da agenda (ex.: no dashboard). São listas pequenas: lidas uma única vez,
 * só quando `enabled` passa a true, e reutilizadas nas aberturas seguintes.
 */
export function useSchedulingReferences(enabled) {
  const [state, setState] = useState(EMPTY)

  useEffect(() => {
    if (!enabled || state.loaded) return undefined
    let ignore = false
    Promise.all([listAgendaStaff(), listAgendaServices()])
      .then(([staff, services]) => {
        if (!ignore) setState({ loaded: true, staff, services, error: '' })
      })
      .catch((error) => {
        console.error(error)
        if (!ignore) {
          setState({
            loaded: false,
            staff: [],
            services: [],
            error: getAgendaErrorMessage(error, 'Não foi possível carregar técnicos e serviços.'),
          })
        }
      })
    // Limpeza: ignora a resposta se a janela fechar antes de os dados chegarem.
    return () => {
      ignore = true
    }
  }, [enabled, state.loaded])

  const servicesById = useMemo(
    () => Object.fromEntries(state.services.map((service) => [service.id, service])),
    [state.services],
  )

  return {
    staff: state.staff,
    services: state.services,
    servicesById,
    loading: enabled && !state.loaded && !state.error,
    error: state.error,
  }
}
