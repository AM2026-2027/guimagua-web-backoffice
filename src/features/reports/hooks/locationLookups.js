import { getDocsByIds } from '../../../services/reportsService'

/**
 * Lê as piscinas e os clientes de uma lista de agendamentos que ainda não estejam em cache
 * (`known`: { pools: Map, clients: Map }). Devolve só os novos, para o hook os juntar ao estado.
 */
export async function fetchMissingLocations(appointments, known) {
  const poolIds = appointments.map((item) => item.pool_id).filter((id) => id && !known.pools.has(id))
  const pools = await getDocsByIds('pools', poolIds)
  const allPools = new Map([...known.pools, ...pools.map((pool) => [pool.id, pool])])
  const clientIds = appointments
    .map((item) => item.client_id ?? allPools.get(item.pool_id)?.client_id)
    .filter((id) => id && !known.clients.has(id))
  const clients = await getDocsByIds('clients', clientIds)
  return { pools, clients }
}

/** Junta documentos novos a um Map existente, sem o alterar (atualização imutável). */
export function mergeIntoMap(map, docs) {
  if (docs.length === 0) return map
  return new Map([...map, ...docs.map((doc) => [doc.id, doc])])
}
