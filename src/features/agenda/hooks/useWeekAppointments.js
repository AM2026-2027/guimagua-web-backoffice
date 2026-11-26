import { useCallback, useEffect, useState } from 'react'
import {
  AGENDA_RANGE_MAX_RESULTS,
  listAgendaAppointmentsInRange,
} from '../../../services/agendaService'
import { getAgendaErrorMessage } from '../utils/errors'
import { getLisbonWeekRange } from '../utils/week'

const EMPTY_WEEK = {
  weekKey: null,
  requestKey: null,
  items: [],
  loading: false,
  error: '',
  warning: '',
}

export function useWeekAppointments(weekKey, enabled, navigationKey) {
  const [week, setWeek] = useState(EMPTY_WEEK)
  const [reloadToken, setReloadToken] = useState(0)
  const requestKey = `${weekKey}:${navigationKey}:${reloadToken}`

  useEffect(() => {
    if (!enabled) return undefined

    let ignore = false

    async function loadWeek() {
      try {
        const range = getLisbonWeekRange(weekKey)
        const result = await listAgendaAppointmentsInRange({
          ...range,
          isCancelled: () => ignore,
        })
        if (ignore || result.cancelled) return

        if (result.overflow) {
          setWeek({
            weekKey,
            requestKey,
            items: [],
            loading: false,
            error: '',
            warning: `Esta semana excede o limite de segurança de ${AGENDA_RANGE_MAX_RESULTS} intervenções. Os resultados parciais não são apresentados.`,
          })
          return
        }

        setWeek({
          weekKey,
          requestKey,
          items: result.items,
          loading: false,
          error: '',
          warning: '',
        })
      } catch (error) {
        console.error(error)
        if (!ignore) {
          setWeek({
            weekKey,
            requestKey,
            items: [],
            loading: false,
            error: getAgendaErrorMessage(error, 'Não foi possível carregar a grelha semanal.'),
            warning: '',
          })
        }
      }
    }

    loadWeek()
    // Limpeza: ignora páginas pendentes quando a semana muda ou se sai da vista semanal.
    return () => {
      ignore = true
    }
  }, [enabled, navigationKey, requestKey, reloadToken, weekKey])

  const reload = useCallback(() => setReloadToken((token) => token + 1), [])
  const currentRequest = week.requestKey === requestKey

  return {
    appointments: currentRequest ? week.items : [],
    loading: enabled && (!currentRequest || week.loading),
    error: currentRequest ? week.error : '',
    warning: currentRequest ? week.warning : '',
    reload,
  }
}
