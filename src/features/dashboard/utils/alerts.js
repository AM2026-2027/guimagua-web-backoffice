import { toDate } from './labels'
import { DEFAULT_ALERT_THRESHOLDS } from './thresholdForm'
import { CHLORINE_RANGE, PH_RANGE, TEMPERATURE_RANGE } from './thresholdValidation'

function evaluateMetric(value, min, max, validBounds) {
  if (!Number.isFinite(value)) return { status: 'missing', outOfBounds: false, label: 'Sem registo' }
  if (value < min) {
    const severe = value < validBounds.min || min - value >= (max - min) * 0.5
    return { status: 'low', outOfBounds: true, severe, label: 'Abaixo do alvo' }
  }
  if (value > max) {
    const severe = value > validBounds.max || value - max >= (max - min) * 0.5
    return { status: 'high', outOfBounds: true, severe, label: 'Acima do alvo' }
  }
  return { status: 'ok', outOfBounds: false, severe: false, label: 'Dentro do alvo' }
}

/**
 * Deduplica `pool_readings` (ordenadas descendentemente no servidor) para ficar apenas com
 * a última leitura de cada `pool_id`, cumprindo a regra D-12.
 */
export function latestReadingsByPool(readings) {
  const byPool = new Map()
  for (const reading of readings) {
    if (!reading.pool_id) continue
    const existing = byPool.get(reading.pool_id)
    if (!existing) {
      byPool.set(reading.pool_id, reading)
      continue
    }
    const existingMs = toDate(existing.timestamp)?.getTime() ?? 0
    const currentMs = toDate(reading.timestamp)?.getTime() ?? 0
    if (currentMs > existingMs) byPool.set(reading.pool_id, reading)
  }
  return [...byPool.values()]
}

/** Avalia uma leitura face aos limiares `settings/alert_thresholds`. */
export function evaluateReadingAgainstThresholds(reading, thresholds) {
  const limits = { ...DEFAULT_ALERT_THRESHOLDS, ...(thresholds ?? {}) }
  const ph = evaluateMetric(reading.ph_level, limits.ph_min, limits.ph_max, PH_RANGE)
  const chlorine = evaluateMetric(
    reading.chlorine_ppm,
    limits.chlorine_min_ppm,
    limits.chlorine_max_ppm,
    CHLORINE_RANGE,
  )
  const temperature = evaluateMetric(
    reading.temperature_c,
    limits.temperature_min_c,
    limits.temperature_max_c,
    TEMPERATURE_RANGE,
  )

  const deviations = [
    ph.outOfBounds ? 'pH' : null,
    chlorine.outOfBounds ? 'Cloro' : null,
    temperature.outOfBounds ? 'Temperatura' : null,
  ].filter(Boolean)

  const hasSevere = ph.severe || chlorine.severe || temperature.severe
  const severity = deviations.length >= 2 || hasSevere ? 'critical' : deviations.length === 1 ? 'warning' : 'ok'

  return { ph, chlorine, temperature, deviations, severity, limits }
}

/**
 * Constrói a lista de alertas de água (D-12: última `pool_reading` de cada piscina fora dos limiares),
 * enriquecida com nome/morada da piscina e nome do cliente.
 */
export function buildPoolAlerts(latestReadings, thresholds, poolsById, clientsById) {
  const alerts = []
  for (const reading of latestReadings) {
    const evaluation = evaluateReadingAgainstThresholds(reading, thresholds)
    if (evaluation.deviations.length === 0) continue

    const pool = poolsById.get(reading.pool_id) ?? null
    const client = pool?.client_id ? clientsById.get(pool.client_id) ?? null : null

    alerts.push({
      id: `pool-alert-${reading.pool_id}`,
      kind: 'water',
      severity: evaluation.severity,
      reading,
      evaluation,
      pool,
      client,
      timestampMs: toDate(reading.timestamp)?.getTime() ?? 0,
    })
  }

  return alerts.sort((a, b) => {
    if (a.severity !== b.severity) return a.severity === 'critical' ? -1 : 1
    return b.timestampMs - a.timestampMs
  })
}

/** Identifica consumíveis ativos abaixo ou no limite mínimo de stock (`min_stock`). */
export function getLowStockConsumables(consumables) {
  return consumables
    .filter((item) => {
      if (item.is_active === false) return false
      const min = Number(item.min_stock)
      if (!Number.isFinite(min) || min <= 0) return false
      const physical = Number(item.stock_quantity ?? 0)
      const projected = item.projected_stock == null ? physical : Number(item.projected_stock)
      return physical <= min || projected <= min
    })
    .map((item) => {
      const min = Number(item.min_stock)
      const physical = Number(item.stock_quantity ?? 0)
      const projected = item.projected_stock == null ? physical : Number(item.projected_stock)
      const critical = physical <= 0 || projected <= 0 || physical <= min * 0.5
      return {
        ...item,
        physical,
        projected,
        min,
        critical,
      }
    })
    .sort((a, b) => {
      if (a.critical !== b.critical) return a.critical ? -1 : 1
      return a.projected - a.min - (b.projected - b.min)
    })
}

/** Percentagens de conformidade calculadas no cliente sobre a última leitura de cada piscina monitorizada. */
export function computeFleetStability(latestReadings, thresholds) {
  const total = latestReadings.length
  if (total === 0) {
    return { total: 0, optimalCount: 0, alertCount: 0, optimalPct: 0, alertPct: 0 }
  }
  let alertCount = 0
  for (const reading of latestReadings) {
    if (evaluateReadingAgainstThresholds(reading, thresholds).deviations.length > 0) {
      alertCount += 1
    }
  }
  const optimalCount = total - alertCount
  const optimalPct = Math.round((optimalCount / total) * 1000) / 10
  const alertPct = Math.round((alertCount / total) * 1000) / 10
  return { total, optimalCount, alertCount, optimalPct, alertPct }
}

/**
 * Deriva a escala diária dos colaboradores ativos (`technician` / `commercial`) cruzando com os
 * `appointments` de hoje. Estado `available` significa sem intervenção em curso nem agendada para hoje.
 */
export function buildDailySchedule(staff, appointments) {
  const activeAppointments = appointments.filter((item) => item.status !== 'cancelled')
  const total = activeAppointments.length
  const completed = activeAppointments.filter((item) => item.status === 'completed').length
  const inProgress = activeAppointments.filter((item) => item.status === 'in_progress').length
  const scheduled = activeAppointments.filter((item) => item.status === 'scheduled').length
  const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0

  const byTech = new Map()
  for (const appointment of activeAppointments) {
    if (!appointment.tech_id) continue
    const list = byTech.get(appointment.tech_id) ?? []
    list.push(appointment)
    byTech.set(appointment.tech_id, list)
  }

  const rows = staff.map((member) => {
    const memberAppointments = [...(byTech.get(member.id) ?? [])].sort(
      (a, b) => (toDate(a.date)?.getTime() ?? 0) - (toDate(b.date)?.getTime() ?? 0),
    )
    const current = memberAppointments.find((item) => item.status === 'in_progress') ?? null
    const nextScheduled = memberAppointments.find((item) => item.status === 'scheduled') ?? null
    const doneCount = memberAppointments.filter((item) => item.status === 'completed').length
    const status = current ? 'in_progress' : nextScheduled ? 'scheduled' : 'available'

    return {
      member,
      status,
      activeAppointment: current ?? nextScheduled,
      totalToday: memberAppointments.length,
      doneCount,
    }
  })

  const priorityOrder = { in_progress: 0, scheduled: 1, available: 2 }
  rows.sort((a, b) => {
    const diff = priorityOrder[a.status] - priorityOrder[b.status]
    if (diff !== 0) return diff
    return (a.member.name ?? '').localeCompare(b.member.name ?? '', 'pt-PT')
  })

  return {
    summary: { total, completed, inProgress, scheduled, completionPct },
    rows,
  }
}
