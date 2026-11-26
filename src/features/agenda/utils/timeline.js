import { dateKeyOf, minutesInLisbon, toDate } from './date'

export function getAppointmentTimeRange(appointment, servicesById) {
  const start = toDate(appointment.date)
  if (!start) return null

  const duration = Number(servicesById[appointment.service_id]?.default_duration_min)
  const normalizedDuration = Number.isFinite(duration) && duration > 0 ? duration : null
  const startDateKey = dateKeyOf(start)
  const startMinute = minutesInLisbon(start)
  if (normalizedDuration === null) {
    return { start, startDateKey, startMinute, end: null, endMinute: null, duration: null }
  }

  const end = new Date(start.getTime() + normalizedDuration * 60_000)
  const endDateKey = dateKeyOf(end)
  const localEndMinute = minutesInLisbon(end)
  return {
    start,
    startDateKey,
    startMinute,
    end,
    endMinute: localEndMinute + (endDateKey !== startDateKey ? 24 * 60 : 0),
    duration: normalizedDuration,
  }
}
