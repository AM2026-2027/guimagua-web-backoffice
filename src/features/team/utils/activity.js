const TIME_ZONE = 'Europe/Lisbon'
const DAY_MS = 24 * 60 * 60 * 1000

const DATE_PARTS = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' })
const OFFSET_PARTS = new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, timeZoneName: 'longOffset' })

/** Diferença (minutos) entre a hora de Lisboa e UTC num dado instante: 0 no inverno, 60 no verão. */
function lisbonOffsetMinutes(ms) {
  const name = OFFSET_PARTS.formatToParts(ms).find((part) => part.type === 'timeZoneName')?.value ?? 'GMT'
  const match = name.match(/GMT([+-])(\d{2}):(\d{2})/)
  if (!match) return 0
  const minutes = Number(match[2]) * 60 + Number(match[3])
  return match[1] === '-' ? -minutes : minutes
}

/** Meia-noite (hora de Lisboa) do dia civil que contém `ms`, em milissegundos UTC. */
function lisbonMidnight(ms) {
  const parts = Object.fromEntries(DATE_PARTS.formatToParts(ms).map((part) => [part.type, part.value]))
  const utcMidnight = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day))
  return utcMidnight - lisbonOffsetMinutes(utcMidnight) * 60 * 1000
}

/**
 * Intervalo [início, fim) do dia de hoje em Lisboa. O fim é calculado como a meia-noite seguinte,
 * para os dias de mudança de hora (23 h ou 25 h) ficarem corretos.
 */
export function lisbonDayRange(nowMs) {
  const start = lisbonMidnight(nowMs)
  const end = lisbonMidnight(start + DAY_MS + 2 * 60 * 60 * 1000)
  return { start, end }
}

/** Agendamentos de hoje agrupados por técnico: { total, completed, inProgress } (cancelados não contam). */
export function summarizeByTech(appointments) {
  const summary = new Map()
  for (const appointment of appointments) {
    if (!appointment.tech_id || appointment.status === 'cancelled') continue
    const current = summary.get(appointment.tech_id) ?? { total: 0, completed: 0, inProgress: 0 }
    summary.set(appointment.tech_id, {
      total: current.total + 1,
      completed: current.completed + (appointment.status === 'completed' ? 1 : 0),
      inProgress: current.inProgress + (appointment.status === 'in_progress' ? 1 : 0),
    })
  }
  return summary
}

/** Estado operacional: inativo, em serviço (há um agendamento em curso) ou disponível. */
export function activityStatus(user, techSummary) {
  if (user.is_active === false) return 'inactive'
  return techSummary?.inProgress > 0 ? 'in_service' : 'available'
}
