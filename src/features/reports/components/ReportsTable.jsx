import StatusBadge from '../../../shared/components/StatusBadge'
import { CARD_CLASS } from '../../../shared/components/uiClasses'
import { formatReportDateTime } from '../utils/dateRange'
import {
  appointmentStatusLabel,
  formatReading,
  poolTreatmentLabel,
  reportTypeLabel,
  technicianInitials,
} from '../utils/labels'
import { isValidReading } from '../utils/readingValidation'

function ReadingChip({ field, label, value, unit = '' }) {
  if (!Number.isFinite(value)) return null
  const valid = isValidReading(field, value)
  return (
    <span
      aria-label={`${label} ${formatReading(value)}${unit}${valid ? '' : ', fora do intervalo válido'}`}
      title={valid ? undefined : 'Valor fora do intervalo de integridade definido'}
      className={`whitespace-nowrap rounded px-2 py-1 font-mono text-xs ${
        valid ? 'bg-slate-100 text-slate-700' : 'bg-red-50 text-red-700 ring-1 ring-red-200'
      }`}
    >
      {label} {formatReading(value)}{unit}
    </span>
  )
}

export default function ReportsTable({ reports }) {
  return (
    <div className={`${CARD_CLASS} overflow-x-auto`}>
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <caption className="sr-only">Intervenções concluídas e leituras associadas</caption>
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th scope="col" className="px-4 py-3">ID / relatório</th>
            <th scope="col" className="px-4 py-3">Data &amp; hora</th>
            <th scope="col" className="px-4 py-3">Cliente &amp; instalação</th>
            <th scope="col" className="px-4 py-3">Técnico</th>
            <th scope="col" className="px-4 py-3">Tipo de intervenção</th>
            <th scope="col" className="px-4 py-3">Parâmetros registados</th>
            <th scope="col" className="px-4 py-3">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {reports.map((report) => {
            const reading = report.latestReading
            const clientName = report.client?.name ?? report.client_name ?? 'Cliente não identificado'
            const poolName = report.pool?.name ?? report.pool?.local_address ?? 'Piscina não identificada'
            const technicianName = report.technician?.name ?? report.tech_name ?? 'Técnico não identificado'
            const equipment = report.pool?.equipment ?? []
            return (
              <tr key={report.id} className="align-top">
                <td className="max-w-56 px-4 py-3">
                  <p className="font-mono text-xs font-semibold text-slate-800" title={report.id}>{report.id}</p>
                  <p className="mt-1 text-xs text-slate-500">{report.report_pdf_path ? 'PDF disponível' : 'Sem PDF registado'}</p>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                  {formatReportDateTime(report.date)}
                  {report.checkin_timestamp && (
                    <p className="mt-1 text-xs text-slate-500">
                      Check-in {formatReportDateTime(report.checkin_timestamp)}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-800">{clientName}</p>
                  <p className="text-xs text-slate-500">{poolName}</p>
                  {report.pool?.treatment_type && (
                    <p className="text-xs text-slate-500">{poolTreatmentLabel(report.pool.treatment_type)}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
                    >
                      {technicianInitials(technicianName)}
                    </span>
                    <span className="text-slate-700">{technicianName}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-700">{report.service?.name ?? 'Serviço não identificado'}</p>
                  <p className="text-xs text-slate-500">{reportTypeLabel(report.service?.type)}</p>
                  {equipment.length > 0 && <p className="mt-1 text-xs text-slate-500">{equipment.join(', ')}</p>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex max-w-64 flex-wrap gap-1">
                    <ReadingChip field="ph_level" label="pH" value={reading?.ph_level} />
                    <ReadingChip field="chlorine_ppm" label="Cl" value={reading?.chlorine_ppm} unit=" ppm" />
                    <ReadingChip field="temperature_c" label="Temp." value={reading?.temperature_c} unit=" °C" />
                    <ReadingChip field="salinity_gl" label="Sal." value={reading?.salinity_gl} unit=" g/L" />
                  </div>
                  {!reading && report.notes && <p className="text-xs text-slate-600">{report.notes}</p>}
                  {!reading && !report.notes && <span className="text-xs text-slate-400">Sem leituras registadas</span>}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <StatusBadge
                    active={report.status === 'completed'}
                    activeLabel={appointmentStatusLabel(report.status)}
                    inactiveLabel={appointmentStatusLabel(report.status)}
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
