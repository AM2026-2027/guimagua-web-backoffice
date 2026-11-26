import { dateKeyOf, minutesInLisbon, toDate } from './date'

/** Dia de trabalho na hora de Lisboa: a agenda mostra 08:00–19:00 e nenhum serviço pode acabar depois das 19:00. */
export const WORKDAY_START_MINUTE = 8 * 60
export const WORKDAY_END_MINUTE = 19 * 60

/** Duração usada quando o agendamento não tem `end_date` e o serviço não tem duração válida. */
export const FALLBACK_DURATION_MIN = 60

/** Duração máxima de um serviço (dicionário de dados: 15 a 480 minutos). */
export const MAX_DURATION_MIN = 480

/** Estados que ocupam o colaborador: todos exceto o cancelado. */
export function occupiesStaff(appointment) {
  return appointment.status !== 'cancelled'
}

/** Duração prevista de um serviço, em minutos, ou null se não estiver definida. */
export function serviceDuration(service) {
  const duration = Number(service?.default_duration_min)
  return Number.isFinite(duration) && duration > 0 ? duration : null
}

export function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60_000)
}

/** "HH:MM" a partir de minutos desde a meia-noite (ex.: 1050 → "17:30"). */
export function minutesToTimeKey(minutes) {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
}

/**
 * O fim previsto passa das 19:00 (hora de Lisboa) ou cai noutro dia? Regra do negócio: o último serviço
 * do dia tem de terminar até às 19:00.
 */
export function endsAfterWorkday(interval) {
  if (!interval) return false
  const endMinute = minutesInLisbon(interval.end)
  return dateKeyOf(interval.end) !== dateKeyOf(interval.start) || endMinute > WORKDAY_END_MINUTE
}

/** Hora de início mais tardia para um serviço com esta duração acabar até às 19:00 ("HH:MM"), ou null. */
export function latestStartTime(durationMinutes) {
  const latest = WORKDAY_END_MINUTE - durationMinutes
  return latest >= 0 ? minutesToTimeKey(latest) : null
}

/**
 * Início e fim previstos de um agendamento: usa `end_date` quando existe; senão, `date` mais a duração
 * do serviço; em último caso, 60 minutos.
 */
export function appointmentInterval(appointment, servicesById) {
  const start = toDate(appointment.date)
  if (!start) return null
  const explicitEnd = toDate(appointment.end_date)
  if (explicitEnd && explicitEnd > start) return { start, end: explicitEnd }
  const duration = serviceDuration(servicesById[appointment.service_id]) ?? FALLBACK_DURATION_MIN
  return { start, end: addMinutes(start, duration) }
}

function overlaps(interval, start, end) {
  // Dois intervalos sobrepõem-se quando cada um começa antes de o outro acabar; encostados
  // (um acaba às 10:00 e o outro começa às 10:00) não contam como conflito.
  return Boolean(interval) && interval.start < end && interval.end > start
}

/** Agendamentos do colaborador que se sobrepõem ao intervalo [start, end) (RF-WEB04). */
export function findOverlaps(appointments, { staffId, start, end, excludeId = null }, servicesById) {
  if (!staffId || !start || !end) return []
  return appointments
    .filter(
      (appointment) =>
        appointment.id !== excludeId && appointment.tech_id === staffId && occupiesStaff(appointment),
    )
    .map((appointment) => ({ appointment, interval: appointmentInterval(appointment, servicesById) }))
    .filter(({ interval }) => overlaps(interval, start, end))
}

/** Mapa `staffId → intervalo ocupado` para marcar no seletor quem já tem serviço no horário escolhido. */
export function busyStaff(appointments, { start, end, excludeId = null }, servicesById) {
  if (!start || !end) return {}
  const busy = {}
  appointments.forEach((appointment) => {
    if (appointment.id === excludeId || !occupiesStaff(appointment) || busy[appointment.tech_id]) return
    const interval = appointmentInterval(appointment, servicesById)
    if (overlaps(interval, start, end)) busy[appointment.tech_id] = interval
  })
  return busy
}

/**
 * Janela de leitura para verificar sobreposições: começa `MAX_DURATION_MIN` antes do início pedido,
 * para apanhar agendamentos que começaram antes (por exemplo no fim do dia anterior) e ainda decorrem.
 */
export function overlapReadWindow(start, end) {
  return { start: addMinutes(start, -MAX_DURATION_MIN), end }
}
