import { dateKeyOf, lisbonDateTime, timeKeyInLisbon } from './date'
import {
  addMinutes,
  appointmentInterval,
  endsAfterWorkday,
  latestStartTime,
  serviceDuration,
} from './schedule'

/** Mensagem quando o serviço acabaria depois das 19:00, com a hora de início mais tardia possível. */
export function workdayEndMessage(interval) {
  const latest = latestStartTime(interval.duration)
  return latest
    ? `O serviço tem de terminar até às 19:00. Com esta duração, a hora de início mais tardia é ${latest}.`
    : 'O serviço tem de terminar até às 19:00.'
}

export const NOTES_MAX_LENGTH = 500

export const EMPTY_APPOINTMENT_FORM = {
  client_id: '',
  pool_id: '',
  service_id: '',
  tech_id: '',
  date: '',
  time: '',
  notes: '',
}

/** Estado inicial de um agendamento novo; a data começa no dia que está aberto na agenda. */
export function newFormState(dateKey) {
  return { ...EMPTY_APPOINTMENT_FORM, date: dateKey ?? '' }
}

/** Estado do formulário para reagendar um agendamento existente (data e hora em Lisboa). */
export function toFormState(appointment) {
  return {
    client_id: appointment.client_id ?? appointment.pool?.client_id ?? '',
    pool_id: appointment.pool_id ?? '',
    service_id: appointment.service_id ?? '',
    tech_id: appointment.tech_id ?? '',
    date: dateKeyOf(appointment.date) ?? '',
    time: timeKeyInLisbon(appointment.date),
    notes: appointment.notes ?? '',
  }
}

/**
 * Início e fim previstos a partir do formulário: o fim é o início mais `default_duration_min` do serviço.
 * Ao reagendar, se o serviço já não tiver duração, mantém a duração original do agendamento.
 */
export function formInterval(form, service, original = null, servicesById = {}) {
  const start = lisbonDateTime(form.date, form.time)
  if (!start) return null
  let duration = serviceDuration(service)
  if (duration == null && original) {
    const interval = appointmentInterval(original, servicesById)
    duration = interval ? Math.round((interval.end - interval.start) / 60_000) : null
  }
  if (duration == null) return null
  return { start, end: addMinutes(start, duration), duration }
}

/**
 * Validação do formulário (dicionário de dados, Agendamentos): cliente, piscina, serviço e colaborador
 * obrigatórios; o início tem de ser no futuro; o serviço tem de ter duração para se calcular o fim.
 * Ao reagendar, o cliente, a piscina e o serviço não mudam e não são validados.
 * Devolve `{ campo: mensagem }`, vazio quando o formulário é válido.
 */
export function validateAppointmentForm(form, { service, interval = null, now = new Date(), isReschedule = false }) {
  const errors = {}
  if (!isReschedule) {
    if (!form.client_id) errors.client_id = 'Selecione o cliente.'
    if (!form.pool_id) errors.pool_id = 'Selecione a piscina.'
    if (!form.service_id) errors.service_id = 'Selecione o tipo de serviço.'
    else if (!serviceDuration(service)) {
      errors.service_id = 'Este serviço não tem duração definida no catálogo.'
    }
  }
  if (!form.tech_id) errors.tech_id = 'Selecione o técnico ou comercial responsável.'
  if (!form.date) errors.date = 'Indique a data.'
  if (!form.time) {
    errors.time = 'Indique a hora de início.'
  } else if (form.date) {
    const start = lisbonDateTime(form.date, form.time)
    if (!start) errors.time = 'Hora inválida.'
    else if (start <= now) errors.time = 'O início tem de ser posterior ao momento atual.'
    else if (endsAfterWorkday(interval)) errors.time = workdayEndMessage(interval)
  }
  if (form.notes.length > NOTES_MAX_LENGTH) errors.notes = `Máximo de ${NOTES_MAX_LENGTH} caracteres.`
  return errors
}

/** Dados a gravar num agendamento novo. O estado, os campos da App e os timestamps são do serviço. */
export function toCreatePayload(form, interval) {
  return {
    client_id: form.client_id,
    pool_id: form.pool_id,
    service_id: form.service_id,
    tech_id: form.tech_id,
    date: interval.start,
    end_date: interval.end,
    notes: form.notes.trim(),
  }
}

/** Dados a gravar ao reagendar: só o início, o fim previsto, o colaborador e as notas. */
export function toReschedulePayload(form, interval) {
  return {
    tech_id: form.tech_id,
    date: interval.start,
    end_date: interval.end,
    notes: form.notes.trim(),
  }
}

/**
 * Colaboradores sugeridos para o tipo de serviço: vistorias comerciais → comerciais; manutenção e
 * reparação → técnicos. Com `showAll`, aparecem todos os colaboradores ativos.
 */
export function eligibleStaff(staff, service, showAll = false) {
  const active = staff.filter((person) => person.is_active !== false)
  const sorted = active.toSorted((left, right) => (left.name ?? '').localeCompare(right.name ?? '', 'pt-PT'))
  if (showAll || !service) return sorted
  const role = service.type === 'commercial_survey' ? 'commercial' : 'technician'
  return sorted.filter((person) => person.role === role)
}
