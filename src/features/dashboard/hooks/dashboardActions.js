import { saveAlertThresholds } from '../../../services/dashboardService'

/** Persiste os limiares de alerta globais em `settings/alert_thresholds` (D-11). */
export async function persistAlertThresholds(payload, adminUid) {
  await saveAlertThresholds(payload, adminUid)
  return payload
}
