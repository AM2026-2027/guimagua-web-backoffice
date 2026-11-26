import { useEffect, useMemo, useState } from 'react'
import { listAppointmentsBetween } from '../../../services/userService'
import { lisbonDayRange, summarizeByTech } from '../utils/activity'

/**
 * Agendamentos de hoje (Europe/Lisbon), só leitura, para a coluna "Visitas hoje" e o estado operacional.
 * Uma única query por abertura do ecrã; em caso de erro, a lista da equipa continua a funcionar.
 */
export function useTodayActivity() {
  const [state, setState] = useState({ loaded: false, appointments: [], error: '' })

  useEffect(() => {
    let ignore = false
    const { start, end } = lisbonDayRange(Date.now())
    listAppointmentsBetween(start, end)
      .then((appointments) => {
        if (!ignore) setState({ loaded: true, appointments, error: '' })
      })
      .catch((error) => {
        console.error(error)
        if (!ignore) setState({ loaded: true, appointments: [], error: 'Não foi possível carregar a atividade de hoje.' })
      })
    // Limpeza: ignora a resposta se o ecrã fechar antes de ela chegar.
    return () => {
      ignore = true
    }
  }, [])

  const byTech = useMemo(() => summarizeByTech(state.appointments), [state.appointments])
  const totalToday = useMemo(
    () => state.appointments.filter((appointment) => appointment.status !== 'cancelled').length,
    [state.appointments],
  )

  return { loaded: state.loaded, error: state.error, byTech, totalToday }
}
