import { CARD_CLASS } from '../../../shared/components/uiClasses'
import { formatDateTime } from '../utils/dates'
import { formatNumber, movementSourceLabel, movementTypeLabel } from '../utils/labels'

/** Tabela apresentacional do registo de movimentos de stock (`staffById` para mostrar quem fez o ajuste). */
export default function StockMovementsTable({ movements, staffById }) {
  return (
    <div className={`${CARD_CLASS} overflow-x-auto`}>
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <caption className="sr-only">Movimentos de stock</caption>
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th scope="col" className="px-4 py-3">Data</th>
            <th scope="col" className="px-4 py-3">Artigo</th>
            <th scope="col" className="px-4 py-3">Tipo</th>
            <th scope="col" className="px-4 py-3 text-right">Quantidade</th>
            <th scope="col" className="px-4 py-3 text-right">Stock antes → depois</th>
            <th scope="col" className="px-4 py-3">Origem e motivo</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {movements.map((movement) => {
            const isIn = movement.type === 'in'
            return (
              <tr key={movement.id}>
                <td className="whitespace-nowrap px-4 py-3 text-slate-800">{formatDateTime(movement.created_at)}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-800">{movement.consumable_name ?? '—'}</div>
                  <div className="font-mono text-xs text-slate-500">{movement.consumable_sku ?? '—'}</div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${
                      isIn ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-red-50 text-red-700 ring-red-200'
                    }`}
                  >
                    {movementTypeLabel(movement.type)}
                  </span>
                </td>
                <td className={`whitespace-nowrap px-4 py-3 text-right font-semibold ${isIn ? 'text-emerald-700' : 'text-red-700'}`}>
                  {isIn ? '+' : '−'}
                  {formatNumber(movement.quantity, movement.unit)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-slate-600">
                  {formatNumber(movement.stock_before)} → {formatNumber(movement.stock_after)}
                </td>
                <td className="px-4 py-3">
                  <div className="text-slate-700">{movementSourceLabel(movement.source)}</div>
                  <div className="text-xs text-slate-500">
                    {movement.reason || '—'}
                    {movement.created_by && staffById.get(movement.created_by) ? ` · ${staffById.get(movement.created_by).name}` : ''}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
