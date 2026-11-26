import { useCallback, useEffect, useState } from 'react'
import {
  AGENDA_RANGE_MAX_RESULTS,
  listAgendaAppointmentsInRange,
} from '../../../services/agendaService'
import { getAgendaErrorMessage } from '../utils/errors'
import { getLisbonMonthRange } from '../utils/month'

const EMPTY_MONTH = {
  monthKey: null,
  requestKey: null,
  items: [],
  loading: false,
  error: '',
  warning: '',
}

export function useMonthAppointments(monthKey, enabled, navigationKey) {
  const [month, setMonth] = useState(EMPTY_MONTH)
  const [reloadToken, setReloadToken] = useState(0)
  const requestKey = `${monthKey}:${navigationKey}:${reloadToken}`

  useEffect(() => {
    if (!enabled) return undefined

    let ignore = false

    async function loadMonth() {
      try {
        const range = getLisbonMonthRange(monthKey)
        const result = await listAgendaAppointmentsInRange({
          ...range,
          isCancelled: () => ignore,
        })
        if (ignore || result.cancelled) return

        if (result.overflow) {
          setMonth({
            monthKey,
            requestKey,
            items: [],
            loading: false,
            error: '',
            warning: `Este mês excede o limite de segurança de ${AGENDA_RANGE_MAX_RESULTS} intervenções. Os totais não são apresentados para evitar resultados incompletos.`,
          })
          return
        }

        if (!ignore) {
          setMonth({
            monthKey,
            requestKey,
            items: result.items,
            loading: false,
            error: '',
            warning: '',
          })
        }
      } catch (error) {
        console.error(error)
        if (!ignore) {
          setMonth({
            monthKey,
            requestKey,
            items: [],
            loading: false,
            error: getAgendaErrorMessage(error, 'Não foi possível carregar a grelha mensal.'),
            warning: '',
          })
        }
      }
    }

    loadMonth()
    // Limpeza: ignora páginas pendentes quando o mês muda ou se sai da vista mensal.
    return () => {
      ignore = true
    }
  }, [enabled, monthKey, navigationKey, reloadToken, requestKey])

  const reload = useCallback(() => setReloadToken((token) => token + 1), [])
  const currentRequest = month.requestKey === requestKey

  return {
    appointments: currentRequest ? month.items : [],
    loading: enabled && (!currentRequest || month.loading),
    error: currentRequest ? month.error : '',
    warning: currentRequest ? month.warning : '',
    reload,
  }
}
