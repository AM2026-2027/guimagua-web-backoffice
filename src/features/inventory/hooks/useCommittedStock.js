import { useEffect, useMemo, useState } from 'react'
import { listCommittingAppointments, listServicesForStock } from '../../../services/inventoryService'
import { committedByConsumable } from '../utils/stock'

/**
 * Stock comprometido (D-10): agendamentos `scheduled`/`in_progress` + `base_consumables` dos serviços.
 * Lido uma vez por abertura do ecrã; se falhar, o inventário continua a funcionar com comprometido 0.
 */
export function useCommittedStock() {
  const [state, setState] = useState({ loaded: false, appointments: [], services: [], error: '' })

  useEffect(() => {
    let ignore = false
    Promise.all([listCommittingAppointments(), listServicesForStock()])
      .then(([appointments, services]) => {
        if (!ignore) setState({ loaded: true, appointments, services, error: '' })
      })
      .catch((error) => {
        console.error(error)
        if (!ignore) {
          setState({
            loaded: true,
            appointments: [],
            services: [],
            error: 'Não foi possível calcular o stock comprometido. Os valores comprometidos aparecem a 0.',
          })
        }
      })
    // Limpeza: ignora a resposta se o ecrã fechar antes de ela chegar.
    return () => {
      ignore = true
    }
  }, [])

  const committed = useMemo(() => committedByConsumable(state.appointments, state.services), [state.appointments, state.services])

  return { loaded: state.loaded, error: state.error, committed, appointmentsCount: state.appointments.length }
}
