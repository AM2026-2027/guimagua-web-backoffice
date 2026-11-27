import { useState } from 'react'
import LoadingSpinner from '../../../shared/components/LoadingSpinner'
import ErrorAlert from '../../../shared/components/ErrorAlert'
import { CARD_CLASS, INPUT_CLASS, SECONDARY_BUTTON } from '../../../shared/components/uiClasses'
import { useStockMovements } from '../hooks/useStockMovements'
import ExportCsvButton from '../components/ExportCsvButton'
import PeriodFields from '../components/PeriodFields'
import StockMovementsTable from '../components/StockMovementsTable'
import { csvFileName } from '../utils/csv'
import { formatDateTime, rangeFromInputs, shiftInputDate, todayInput } from '../utils/dates'
import { MOVEMENT_TYPES, movementSourceLabel, movementTypeLabel, normalizeText } from '../utils/labels'

const MOVEMENTS_CSV_COLUMNS = [
  { header: 'Data', value: (row) => formatDateTime(row.created_at) },
  { header: 'SKU', value: (row) => row.consumable_sku ?? '' },
  { header: 'Artigo', value: (row) => row.consumable_name ?? '' },
  { header: 'Tipo', value: (row) => movementTypeLabel(row.type) },
  { header: 'Quantidade', value: (row) => row.quantity },
  { header: 'Unidade', value: (row) => row.unit ?? '' },
  { header: 'Stock antes', value: (row) => row.stock_before },
  { header: 'Stock depois', value: (row) => row.stock_after },
  { header: 'Origem', value: (row) => movementSourceLabel(row.source) },
  { header: 'Motivo', value: (row) => row.reason ?? '' },
]

/** Separador "Movimentos de stock": registo `stock_movements` do inventário, com filtros e exportação. */
export default function StockMovementsPanel({ reference }) {
  const [period, setPeriod] = useState({ from: '', to: '' })
  const [type, setType] = useState('')
  const [search, setSearch] = useState('')

  const { startMs, endMs } = rangeFromInputs(period.from, period.to)
  const stock = useStockMovements({ type, startMs, endMs })

  // Estado derivado: pesquisa local por artigo, SKU ou motivo, e totais dos movimentos carregados.
  const term = normalizeText(search)
  const visible = stock.movements.filter(
    (movement) => !term || [movement.consumable_name, movement.consumable_sku, movement.reason].some((value) => normalizeText(value).includes(term)),
  )
  const entries = visible.filter((movement) => movement.type === 'in').length
  const exits = visible.filter((movement) => movement.type === 'out').length

  function quickPeriod(days) {
    const today = todayInput(Date.now())
    setPeriod({ from: shiftInputDate(today, -(days - 1)), to: today })
  }

  return (
    <div className="space-y-4">
      <div className={`${CARD_CLASS} space-y-4 p-4`}>
        <PeriodFields idPrefix="movements" from={period.from} to={period.to} onChange={setPeriod} onQuick={quickPeriod} />
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="lg:w-56">
            <label htmlFor="movements-type" className="text-sm font-medium text-slate-700">
              Tipo
            </label>
            <select id="movements-type" value={type} onChange={(event) => setType(event.target.value)} className={INPUT_CLASS}>
              {MOVEMENT_TYPES.map((option) => (
                <option key={option.value || 'all'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label htmlFor="movements-search" className="text-sm font-medium text-slate-700">
              Pesquisar nos resultados
            </label>
            <input
              id="movements-search"
              type="search"
              placeholder="Artigo, SKU ou motivo"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className={INPUT_CLASS}
            />
          </div>
          <div className="pb-0.5">
            <ExportCsvButton rows={visible} columns={MOVEMENTS_CSV_COLUMNS} fileName={csvFileName('movimentos-stock', period.to || period.from)} />
          </div>
        </div>
        <p className="text-sm text-slate-600">
          Nos movimentos carregados: <strong className="text-emerald-700">{entries} entrada{entries === 1 ? '' : 's'}</strong> e{' '}
          <strong className="text-red-700">{exits} saída{exits === 1 ? '' : 's'}</strong>.
        </p>
      </div>

      {stock.loading ? (
        <LoadingSpinner label="A carregar movimentos..." />
      ) : stock.error ? (
        <div className="space-y-3">
          <ErrorAlert message={stock.error} />
          <button type="button" onClick={stock.reload} className={SECONDARY_BUTTON}>
            Tentar novamente
          </button>
        </div>
      ) : visible.length === 0 ? (
        <div className={`${CARD_CLASS} p-8 text-center text-sm text-slate-500`}>
          {stock.movements.length === 0 ? 'Não há movimentos de stock com estes filtros.' : 'Nenhum movimento carregado corresponde à pesquisa.'}
        </div>
      ) : (
        <StockMovementsTable movements={visible} staffById={reference.staffById} />
      )}

      <ErrorAlert message={stock.moreError} />
      {!stock.loading && !stock.error && stock.hasMore && (
        <div className="flex justify-center">
          <button type="button" onClick={stock.loadMore} disabled={stock.loadingMore} className={SECONDARY_BUTTON}>
            {stock.loadingMore ? 'A carregar...' : 'Carregar mais'}
          </button>
        </div>
      )}
    </div>
  )
}
