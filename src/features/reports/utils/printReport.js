import { appointmentStatusLabel, formatNumber } from './labels'
import { checkinDelayMinutes, formatDateTime } from './dates'
import { checklistEntries } from './interventions'

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * HTML imprimível do relatório de uma intervenção (fase 1 do RF-WEB08: impressão/"Guardar como PDF" do
 * browser, sem dependências nem Storage). Função pura: recebe os dados já carregados e devolve o HTML.
 */
export function buildInterventionPrintHtml({ intervention, readings, consumables }) {
  const delay = checkinDelayMinutes(intervention)
  const checklist = checklistEntries(intervention.checklist_results)
  const rows = (pairs) => pairs.map(([label, value]) => `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`).join('')

  const readingsHtml = readings.length
    ? `<table class="grid"><tr><th>Registo</th><th>pH</th><th>Cloro (ppm)</th><th>Temperatura (°C)</th><th>Salinidade (g/L)</th></tr>${readings
        .map(
          (reading) =>
            `<tr><td>${escapeHtml(formatDateTime(reading.timestamp))}</td><td>${escapeHtml(formatNumber(reading.ph_level))}</td><td>${escapeHtml(formatNumber(reading.chlorine_ppm))}</td><td>${escapeHtml(formatNumber(reading.temperature_c))}</td><td>${escapeHtml(formatNumber(reading.salinity_gl))}</td></tr>`,
        )
        .join('')}</table>`
    : '<p class="muted">Sem leituras registadas.</p>'

  const checklistHtml = checklist.length
    ? `<ul>${checklist.map((item) => `<li>${item.done ? '✔' : '✘'} ${escapeHtml(item.task)}</li>`).join('')}</ul>`
    : '<p class="muted">Sem checklist registada.</p>'

  const consumablesHtml = consumables.length
    ? `<ul>${consumables.map((item) => `<li>${escapeHtml(item.name)}: ${escapeHtml(formatNumber(item.quantity, item.unit))}</li>`).join('')}</ul>`
    : '<p class="muted">Sem consumíveis registados.</p>'

  return `<!doctype html>
<html lang="pt-PT"><head><meta charset="utf-8"><title>Relatório de intervenção — ${escapeHtml(intervention.clientName)}</title>
<style>
  body { font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; color: #1e293b; margin: 32px; }
  h1 { color: #0B4F6C; margin: 0 0 4px; font-size: 22px; }
  h2 { color: #0B4F6C; font-size: 15px; margin: 24px 0 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
  .muted { color: #64748b; }
  table { border-collapse: collapse; width: 100%; font-size: 13px; }
  th, td { text-align: left; padding: 4px 8px; vertical-align: top; }
  table.info th { width: 30%; color: #475569; font-weight: 600; }
  table.grid th, table.grid td { border: 1px solid #e2e8f0; }
  ul { margin: 0; padding-left: 18px; font-size: 13px; }
  footer { margin-top: 32px; font-size: 11px; color: #94a3b8; }
</style></head>
<body>
  <h1>Guimágua Smart Pool — Relatório de intervenção</h1>
  <p class="muted">${escapeHtml(intervention.serviceName)} · ${escapeHtml(formatDateTime(intervention.date))}</p>
  <h2>Dados da intervenção</h2>
  <table class="info">${rows([
    ['Cliente', intervention.clientName],
    ['Piscina', intervention.poolName],
    ['Técnico', intervention.techName],
    ['Estado', appointmentStatusLabel(intervention.status)],
    ['Check-in', `${formatDateTime(intervention.checkin_timestamp)}${delay === null ? '' : ` (${delay > 0 ? `+${delay}` : delay} min face ao previsto)`}`],
    ['Anomalia reportada', intervention.anomaly_reported ? 'Sim' : 'Não'],
  ])}</table>
  <h2>Leituras físico-químicas</h2>${readingsHtml}
  <h2>Checklist</h2>${checklistHtml}
  <h2>Consumíveis usados</h2>${consumablesHtml}
  <h2>Notas do técnico</h2><p>${escapeHtml(intervention.notes || '—')}</p>
  <footer>Documento gerado no backoffice Guimágua.</footer>
</body></html>`
}
