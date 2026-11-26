import { useCallback, useState } from 'react'
import {
  cancelAppointment,
  createAppointment,
  listAppointmentsInRange,
  rescheduleAppointment,
} from '../../../services/agendaService'
import { formatTime } from '../utils/date'
import { getAgendaSaveErrorMessage } from '../utils/errors'
import { findOverlaps, overlapReadWindow } from '../utils/schedule'
import { serviceConsumableDeltas } from '../utils/stock'

/**
 * Volta a ler a agenda do colaborador imediatamente antes de gravar (RF-WEB04): os dados mostrados no
 * formulário podem estar desatualizados se alguém marcou outro serviço entretanto.
 * Devolve a mensagem de conflito, ou '' quando o horário está livre.
 */
async function checkOverlap({ staffId, start, end, excludeId }, servicesById) {
  const range = overlapReadWindow(start, end)
  const appointments = await listAppointmentsInRange(range.start, range.end)
  const [conflict] = findOverlaps(appointments, { staffId, start, end, excludeId }, servicesById)
  if (!conflict) return ''
  return `O colaborador já tem um serviço das ${formatTime(conflict.interval.start)} às ${formatTime(conflict.interval.end)}. Escolha outro horário ou outro colaborador.`
}

/** Criar, reagendar e cancelar agendamentos. Cada operação devolve true/false e deixa o erro em `error`. */
export function useAppointmentActions(servicesById) {
  const [error, setError] = useState('')
  const clearError = useCallback(() => setError(''), [])

  const create = useCallback(
    async (payload) => {
      setError('')
      try {
        const conflict = await checkOverlap(
          { staffId: payload.tech_id, start: payload.date, end: payload.end_date },
          servicesById,
        )
        if (conflict) {
          setError(conflict)
          return false
        }
        // Reserva no stock projetado os consumíveis previstos pelo serviço (D-10).
        const deltas = serviceConsumableDeltas(servicesById[payload.service_id])
        await createAppointment(payload, deltas)
        return true
      } catch (caught) {
        console.error(caught)
        setError(getAgendaSaveErrorMessage(caught, 'Não foi possível criar o agendamento.'))
        return false
      }
    },
    [servicesById],
  )

  const reschedule = useCallback(
    async (appointmentId, payload) => {
      setError('')
      try {
        const conflict = await checkOverlap(
          { staffId: payload.tech_id, start: payload.date, end: payload.end_date, excludeId: appointmentId },
          servicesById,
        )
        if (conflict) {
          setError(conflict)
          return false
        }
        await rescheduleAppointment(appointmentId, payload)
        return true
      } catch (caught) {
        console.error(caught)
        setError(getAgendaSaveErrorMessage(caught, 'Não foi possível reagendar.'))
        return false
      }
    },
    [servicesById],
  )

  const cancel = useCallback(
    async (appointment) => {
      setError('')
      try {
        // Devolve ao stock projetado as quantidades atuais do serviço (D-10).
        const deltas = serviceConsumableDeltas(servicesById[appointment.service_id])
        await cancelAppointment(appointment.id, deltas)
        return true
      } catch (caught) {
        console.error(caught)
        setError(getAgendaSaveErrorMessage(caught, 'Não foi possível cancelar o agendamento.'))
        return false
      }
    },
    [servicesById],
  )

  return { create, reschedule, cancel, error, clearError }
}
