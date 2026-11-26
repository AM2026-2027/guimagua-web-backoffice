import { CARD_CLASS, LINK_BUTTON, LINK_DANGER_BUTTON } from '../../../shared/components/uiClasses'
import { STOCK_STATUS, categoryLabel, formatPrice, formatQuantity } from '../utils/labels'

/**
 * Tabela apresentacional. Cada linha recebe já calculados o comprometido, o projetado e o estado
 * (`rows`: { item, committed, projected, status }).
 */
export default function InventoryTable({ rows, committedLoaded, onAdjust, onEdit, onToggleActive }) {
  return (
    <div className={`${CARD_CLASS} overflow-x-auto`}>
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <caption className="sr-only">Inventário de consumíveis</caption>
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th scope="col" className="px-4 py-3">SKU</th>
            <th scope="col" className="px-4 py-3">Artigo</th>
            <th scope="col" className="px-4 py-3 text-right">Stock físico</th>
            <th scope="col" className="px-4 py-3 text-right">Comprometido</th>
            <th scope="col" className="px-4 py-3 text-right">Projetado</th>
            <th scope="col" className="px-4 py-3">Estado</th>
            <th scope="col" className="px-4 py-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map(({ item, committed, projected, status }) => {
            const active = item.is_active !== false
            const badge = STOCK_STATUS[status]
            return (
              <tr key={item.id} className={active ? '' : 'bg-slate-50/60 text-slate-500'}>
                <td className="whitespace-nowrap px-4 py-3">
                  <span className="rounded-md bg-sky-50 px-2 py-0.5 font-mono text-xs font-semibold text-primary">{item.sku || '—'}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-800">{item.name}</div>
                  <div className="text-xs text-slate-500">
                    {categoryLabel(item.category)} · {formatPrice(item.unit_price)}/{item.unit || 'un'} · {item.supplier || '—'}
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-slate-800">{formatQuantity(item.stock_quantity, item.unit)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-slate-500">
                  {committedLoaded ? formatQuantity(committed, item.unit) : '…'}
                </td>
                <td className={`whitespace-nowrap px-4 py-3 text-right font-semibold ${projected <= 0 && active ? 'text-red-600' : 'text-slate-800'}`}>
                  {committedLoaded ? formatQuantity(projected, item.unit) : '…'}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${badge.className}`}>
                    <span aria-hidden="true">•</span>
                    {badge.label}
                  </span>
                  {active && status !== 'inactive' && (
                    <div className="mt-1 text-xs text-slate-400">Mínimo: {formatQuantity(item.min_stock, item.unit)}</div>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    {active && (
                      <button type="button" onClick={() => onAdjust(item)} className={LINK_BUTTON} aria-label={`Ajustar stock de ${item.name}`}>
                        Ajustar stock
                      </button>
                    )}
                    <button type="button" onClick={() => onEdit(item)} className={LINK_BUTTON} aria-label={`Editar ${item.name}`}>
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleActive(item)}
                      className={active ? LINK_DANGER_BUTTON : LINK_BUTTON}
                      aria-label={`${active ? 'Inativar' : 'Reativar'} ${item.name}`}
                    >
                      {active ? 'Inativar' : 'Reativar'}
                    </button>
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
