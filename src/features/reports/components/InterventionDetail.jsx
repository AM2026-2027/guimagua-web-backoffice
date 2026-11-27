import Modal from '../../../shared/components/Modal'
import LoadingSpinner from '../../../shared/components/LoadingSpinner'
import ErrorAlert from '../../../shared/components/ErrorAlert'
import { PRIMARY_BUTTON, SECONDARY_BUTTON } from '../../../shared/components/uiClasses'
import StatusPill from './StatusPill'
import { checkinDelayMinutes, formatDateTime } from '../utils/dates'
import { checklistEntries } from '../utils/interventions'
import { formatNumber } from '../utils/labels'
import { buildInterventionPrintHtml } from '../utils/printReport'

function Section({ title, children }) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
      {children}
    </section>
  )
}

/**
 * Detalhe de uma intervenção (US10): dados, leituras, checklist, consumíveis e notas.
 * "Imprimir / Guardar PDF" abre o relatório numa janela própria e usa a impressão do browser
 * (fase 1 do RF-WEB08, sem dependências nem Storage).
 */
export default function InterventionDetail({ intervention, detail, onClose }) {
  const delay = checkinDelayMinutes(intervention)
  const checklist = checklistEntries(intervention.checklist_results)
  const photos = Array.isArray(intervention.photo_paths) ? intervention.photo_paths.length : 0

  function handlePrint() {
    const printWindow = window.open('', '_blank', 'width=900,height=1000')
    if (!printWindow) return
    printWindow.document.write(buildInterventionPrintHtml({ intervention, readings: detail.readings, consumables: detail.consumables }))
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  return (
    <Modal title={`Intervenção de ${formatDateTime(intervention.date)}`} description={`${intervention.serviceName} · ${intervention.clientName}`} onClose={onClose} size="lg">
      <div className="space-y-6">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Cliente e piscina</dt>
            <dd className="font-medium text-slate-800">
              {intervention.clientName} · {intervention.poolName}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Técnico</dt>
            <dd className="font-medium text-slate-800">{intervention.techName}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Estado</dt>
            <dd>
              <StatusPill status={intervention.status} />
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Check-in</dt>
            <dd className="font-medium text-slate-800">
              {formatDateTime(intervention.checkin_timestamp)}
              {delay !== null && (
                <span className={`ml-2 text-xs ${delay > 15 ? 'text-amber-700' : 'text-slate-500'}`}>
                  ({delay > 0 ? `+${delay}` : delay} min face ao previsto)
                </span>
              )}
            </dd>
          </div>
        </dl>

        {intervention.anomaly_reported && (
          <p role="status" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            O técnico reportou uma anomalia nesta intervenção.
          </p>
        )}

        {detail.loading ? (
          <LoadingSpinner label="A carregar leituras e consumíveis..." />
        ) : detail.error ? (
          <ErrorAlert message={detail.error} />
        ) : (
          <>
            <Section title="Leituras físico-químicas">
              {detail.readings.length === 0 ? (
                <p className="text-sm text-slate-400">Sem leituras registadas.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="text-left text-xs text-slate-500">
                      <tr>
                        <th scope="col" className="py-1 pr-4">Registo</th>
                        <th scope="col" className="py-1 pr-4">pH</th>
                        <th scope="col" className="py-1 pr-4">Cloro</th>
                        <th scope="col" className="py-1 pr-4">Temperatura</th>
                        <th scope="col" className="py-1 pr-4">Salinidade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.readings.map((reading) => (
                        <tr key={reading.id} className="border-t border-slate-100">
                          <td className="py-1 pr-4">{formatDateTime(reading.timestamp)}</td>
                          <td className="py-1 pr-4">{formatNumber(reading.ph_level)}</td>
                          <td className="py-1 pr-4">{formatNumber(reading.chlorine_ppm, 'ppm')}</td>
                          <td className="py-1 pr-4">{formatNumber(reading.temperature_c, '°C')}</td>
                          <td className="py-1 pr-4">{formatNumber(reading.salinity_gl, 'g/L')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Section>

            <Section title="Consumíveis usados">
              {detail.consumables.length === 0 ? (
                <p className="text-sm text-slate-400">Sem consumíveis registados.</p>
              ) : (
                <ul className="space-y-1 text-sm">
                  {detail.consumables.map((item) => (
                    <li key={item.id} className="flex justify-between gap-4 border-b border-slate-100 py-1">
                      <span>{item.name}</span>
                      <span className="font-medium">{formatNumber(item.quantity, item.unit)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          </>
        )}

        <Section title="Checklist">
          {checklist.length === 0 ? (
            <p className="text-sm text-slate-400">Sem checklist registada.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {checklist.map((item) => (
                <li key={item.task} className="flex items-start gap-2">
                  <span aria-hidden="true" className={item.done ? 'text-emerald-600' : 'text-red-600'}>
                    {item.done ? '✔' : '✘'}
                  </span>
                  <span>
                    {item.task}
                    <span className="sr-only">{item.done ? ' (feito)' : ' (não feito)'}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Notas do técnico">
          <p className="whitespace-pre-line text-sm text-slate-700">{intervention.notes || '—'}</p>
        </Section>

        <p className="text-xs text-slate-500">
          {photos === 0 ? 'Sem fotografias.' : `${photos} fotografia${photos === 1 ? '' : 's'} registada${photos === 1 ? '' : 's'} (visualização na fase 2, com o Storage).`}
        </p>

        <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
          <button type="button" onClick={onClose} className={SECONDARY_BUTTON}>
            Fechar
          </button>
          <button type="button" onClick={handlePrint} disabled={detail.loading} className={PRIMARY_BUTTON}>
            Imprimir / Guardar PDF
          </button>
        </div>
      </div>
    </Modal>
  )
}
