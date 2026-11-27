import { useEffect, useState } from 'react'
import { getDocsByIds, listReadingsByAppointment } from '../../../services/reportsService'
import { getReportsErrorMessage } from '../utils/errors'

const EMPTY = { key: null, readings: [], consumables: [], error: '' }

/**
 * Detalhe de uma intervenção, lido só quando se abre: leituras (`pool_readings`) e nomes dos consumíveis
 * usados (`consumables_used` → `consumables`). Devolve os consumíveis já com nome, quantidade e unidade.
 */
export function useInterventionDetail(intervention) {
  const [state, setState] = useState(EMPTY)
  const key = intervention?.id ?? null

  useEffect(() => {
    if (!intervention) return undefined
    let ignore = false
    const used = Array.isArray(intervention.consumables_used) ? intervention.consumables_used : []
    Promise.all([listReadingsByAppointment(intervention.id), getDocsByIds('consumables', used.map((item) => item.consumable_id))])
      .then(([readings, docs]) => {
        if (ignore) return
        const byId = new Map(docs.map((doc) => [doc.id, doc]))
        const consumables = used.map((item, index) => {
          const doc = byId.get(item.consumable_id)
          return {
            id: `${item.consumable_id ?? 'item'}-${index}`,
            name: doc?.name ?? 'Consumível removido',
            unit: doc?.unit ?? '',
            quantity: item.quantity_used,
          }
        })
        setState({ key: intervention.id, readings, consumables, error: '' })
      })
      .catch((error) => {
        console.error(error)
        if (!ignore) setState({ ...EMPTY, key: intervention.id, error: getReportsErrorMessage(error, 'Não foi possível carregar o detalhe.') })
      })
    // Limpeza: ignora a resposta se o detalhe fechar ou mudar de intervenção antes de ela chegar.
    return () => {
      ignore = true
    }
  }, [intervention])

  const loading = Boolean(key) && state.key !== key
  return loading || !key ? { ...EMPTY, loading } : { ...state, loading: false }
}
