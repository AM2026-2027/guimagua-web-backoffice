import { useEffect, useMemo, useState } from 'react'
import { listTechRoute } from '../../../services/reportsService'
import { dayRangeFromInput } from '../utils/dates'
import { getReportsErrorMessage } from '../utils/errors'
import { decorateAppointment } from '../utils/interventions'
import { fetchMissingLocations } from './locationLookups'

const EMPTY = { key: null, items: [], pools: new Map(), clients: new Map(), error: '' }

/**
 * Rota de um técnico num dia (RF-WEB07): agendamentos do dia em Lisboa, por ordem de hora, com piscina
 * e cliente. Só lê quando há técnico e dia escolhidos.
 */
export function useTeamRoute(techId, day, reference) {
  const [state, setState] = useState(EMPTY)
  const key = techId && day ? `${techId}|${day}` : null

  useEffect(() => {
    if (!techId || !day) return undefined
    let ignore = false
    const { startMs, endMs } = dayRangeFromInput(day)
    async function load() {
      try {
        const items = await listTechRoute(techId, startMs, endMs)
        const missing = await fetchMissingLocations(items, { pools: new Map(), clients: new Map() })
        if (!ignore) {
          setState({
            key: `${techId}|${day}`,
            items,
            pools: new Map(missing.pools.map((pool) => [pool.id, pool])),
            clients: new Map(missing.clients.map((client) => [client.id, client])),
            error: '',
          })
        }
      } catch (error) {
        console.error(error)
        if (!ignore) setState({ ...EMPTY, key: `${techId}|${day}`, error: getReportsErrorMessage(error, 'Não foi possível carregar a rota.') })
      }
    }
    load()
    // Limpeza: ao mudar de técnico ou de dia, a resposta anterior é ignorada.
    return () => {
      ignore = true
    }
  }, [techId, day])

  const visits = useMemo(() => {
    const lookups = { pools: state.pools, clients: state.clients, staff: reference.staffById, services: reference.servicesById }
    return state.items.map((item) => decorateAppointment(item, lookups))
  }, [state, reference.staffById, reference.servicesById])

  const loading = Boolean(key) && state.key !== key
  return { visits: loading || !key ? [] : visits, loading, error: loading ? '' : state.error, selected: Boolean(key) }
}
