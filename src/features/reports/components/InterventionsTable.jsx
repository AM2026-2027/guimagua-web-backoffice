import { CARD_CLASS, LINK_BUTTON } from '../../../shared/components/uiClasses'
import StatusPill from './StatusPill'
import { formatDateTime } from '../utils/dates'

/** Tabela apresentacional do histórico de intervenções (`rows` já com os nomes). */
export default function InterventionsTable({ rows, onOpen }) {
  return (
    <div className={`${CARD_CLASS} overflow-x-auto`}>
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <caption className="sr-only">Histórico de intervenções</caption>
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th scope="col" className="px-4 py-3">Data</th>
            <th scope="col" className="px-4 py-3">Cliente e piscina</th>
            <th scope="col" className="px-4 py-3">Serviço</th>
            <th scope="col" className="px-4 py-3">Técnico</th>
            <th scope="col" className="px-4 py-3">Estado</th>
            <th scope="col" className="px-4 py-3">Registos</th>
            <th scope="col" className="px-4 py-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="whitespace-nowrap px-4 py-3 text-slate-800">{formatDateTime(row.date)}</td>
              <td className="px-4 py-3">
                <div className="font-medium text-slate-800">{row.clientName}</div>
                <div className="text-xs text-slate-500">{row.poolName}</div>
              </td>
              <td className="px-4 py-3 text-slate-700">{row.serviceName}</td>
              <td className="px-4 py-3 text-slate-700">{row.techName}</td>
              <td className="px-4 py-3">
                <StatusPill status={row.status} />
                {row.anomaly_reported && <div className="mt-1 text-xs font-medium text-red-600">Anomalia reportada</div>}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">
                {(row.consumables_used ?? []).length} consumíveis · {(row.photo_paths ?? []).length} fotos
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right">
                <button type="button" onClick={() => onOpen(row)} className={LINK_BUTTON} aria-label={`Ver detalhe da intervenção de ${formatDateTime(row.date)}`}>
                  Ver detalhe
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
