import { useState } from 'react'
import {
  SAFETY_MARGIN_SERVICES,
  STOCK_LEVEL,
  findAlternatives,
  formatQuantity,
  stockCoverage,
} from '../utils/stock'
import { inputClass } from './FormField'
import StockDot from './StockDot'

function optionLabel(consumable) {
  const unit = consumable.unit ? ` (${consumable.unit})` : ''
  const hasStock = consumable.stock_quantity !== undefined && consumable.stock_quantity !== null
  const stock = !hasStock ? '' : Number(consumable.stock_quantity) <= 0
    ? ' — sem stock'
    : ` — em armazém: ${formatQuantity(consumable.stock_quantity, consumable.unit)}`
  return `${consumable.name}${unit}${stock}`
}

function coverageText(coverage, unit) {
  if (coverage.level === STOCK_LEVEL.UNKNOWN) {
    return coverage.stock === null ? 'Stock por registar no inventário.' : 'Indique a quantidade para calcular o stock.'
  }
  const balance = `Saldo após 1 intervenção: ${formatQuantity(coverage.balance, unit)}`
  if (coverage.level === STOCK_LEVEL.INSUFFICIENT) return `${balance} — stock insuficiente para 1 intervenção.`
  const services = coverage.services === 1 ? '1 intervenção' : `${coverage.services} intervenções`
  if (coverage.level === STOCK_LEVEL.MARGIN) return `${balance} — chega só para ${services} (margem mínima).`
  return `${balance} — chega para ${services}.`
}

/**
 * Produtos obrigatórios do serviço (`base_consumables`): artigo + quantidade necessária por intervenção.
 * A agenda usa estas quantidades para calcular o stock comprometido (D-10).
 *
 * Semáforo (saldo = stock em armazém − quantidade necessária):
 * - verde: stock de sobra (mais de 3 intervenções);
 * - amarelo: chega para 1 a 3 intervenções (margem mínima de segurança);
 * - vermelho: saldo negativo, não chega para 1 intervenção.
 * Um artigo sem stock PODE ser escolhido (o serviço é um modelo e o stock repõe-se);
 * a lista apenas alerta e propõe alternativas com stock de sobra.
 */
export default function BaseConsumablesEditor({
  items,
  consumables,
  notFoundIds,
  hasMore,
  loading,
  loadError,
  errors,
  disabled,
  onAdd,
  onQuantityChange,
  onReplace,
  onRemove,
  onLoadMore,
}) {
  const [selectedId, setSelectedId] = useState('')

  const consumablesById = new Map(consumables.map((consumable) => [consumable.id, consumable]))
  const chosenIds = new Set(items.map((item) => item.consumable_id))
  // Podem associar-se consumíveis ativos ainda não escolhidos, com ou sem stock.
  const available = consumables
    .filter((consumable) => consumable.is_active !== false && !chosenIds.has(consumable.id))
    .toSorted((first, second) => String(first.name ?? '').localeCompare(String(second.name ?? ''), 'pt-PT'))
  const rows = items.map((item) => {
    const consumable = consumablesById.get(item.consumable_id)
    return { item, consumable, coverage: stockCoverage(consumable, item.quantity) }
  })
  const insufficientCount = rows.filter((row) => row.coverage.level === STOCK_LEVEL.INSUFFICIENT).length
  const marginCount = rows.filter((row) => row.coverage.level === STOCK_LEVEL.MARGIN).length

  function handleAdd() {
    if (!selectedId) return
    onAdd(selectedId)
    setSelectedId('')
  }

  return (
    <fieldset className="rounded-xl border border-slate-200 p-4">
      <legend className="px-1 text-sm font-semibold text-slate-800">Consumíveis e produtos obrigatórios</legend>
      <p className="mb-3 text-xs text-slate-600">
        Quantidade necessária em cada intervenção, comparada com o stock em armazém.
        Conta para o stock comprometido dos agendamentos.
      </p>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <label htmlFor="consumable-picker" className="block text-sm font-medium text-slate-700">Artigo</label>
          <select
            id="consumable-picker"
            className={inputClass}
            value={selectedId}
            onChange={(event) => setSelectedId(event.target.value)}
            disabled={disabled || available.length === 0}
          >
            <option value="">
              {loading && consumables.length === 0
                ? 'A carregar consumíveis…'
                : available.length === 0 ? 'Sem consumíveis disponíveis' : 'Selecione um artigo'}
            </option>
            {available.map((consumable) => (
              <option key={consumable.id} value={consumable.id}>{optionLabel(consumable)}</option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={disabled || !selectedId}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Associar produto
        </button>
      </div>

      {hasMore && (
        <button type="button" onClick={onLoadMore} disabled={loading} className="mt-2 text-sm font-medium text-primary underline-offset-2 hover:underline disabled:opacity-50">
          {loading ? 'A carregar…' : 'Carregar mais consumíveis'}
        </button>
      )}
      {loadError && <p role="alert" className="mt-2 text-xs text-red-700">{loadError}</p>}
      {!loading && !loadError && consumables.length === 0 && (
        <p className="mt-2 text-xs text-slate-600">Não há consumíveis registados. Crie-os primeiro no módulo Inventário.</p>
      )}

      {(insufficientCount > 0 || marginCount > 0) && (
        <div role="status" className={`mt-4 rounded-lg border px-3 py-2 text-sm ${insufficientCount > 0 ? 'border-red-200 bg-red-50 text-red-800' : 'border-amber-200 bg-amber-50 text-amber-900'}`}>
          {insufficientCount > 0 && (
            <p>{insufficientCount === 1 ? '1 artigo não tem' : `${insufficientCount} artigos não têm`} stock suficiente para 1 intervenção.</p>
          )}
          {marginCount > 0 && (
            <p>{marginCount === 1 ? '1 artigo só tem' : `${marginCount} artigos só têm`} stock para {SAFETY_MARGIN_SERVICES} intervenções ou menos.</p>
          )}
          <p className="mt-1 text-xs">O serviço pode ser guardado na mesma; reponha o stock ou escolha uma alternativa.</p>
        </div>
      )}

      {rows.length > 0 && (
        <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full min-w-[560px] text-left text-sm">
            <caption className="sr-only">Produtos obrigatórios e cobertura de stock</caption>
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
              <tr>
                <th scope="col" className="px-3 py-2 font-semibold">Artigo</th>
                <th scope="col" className="px-3 py-2 font-semibold">Necessário</th>
                <th scope="col" className="px-3 py-2 font-semibold">Em armazém</th>
                <th scope="col" className="px-3 py-2"><span className="sr-only">Remover</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ item, consumable, coverage }) => {
                const name = consumable?.name
                  ?? (notFoundIds.includes(item.consumable_id) ? 'Consumível não encontrado' : 'A carregar…')
                const inputId = `consumable-quantity-${item.consumable_id}`
                const error = errors[`base_consumables.${item.consumable_id}`]
                const atRisk = coverage.level === STOCK_LEVEL.INSUFFICIENT || coverage.level === STOCK_LEVEL.MARGIN
                const alternatives = atRisk ? findAlternatives(consumable, item.quantity, consumables, chosenIds) : []
                return (
                  <tr key={item.consumable_id} className="border-t border-slate-100 align-top">
                    <td className="px-3 py-2">
                      <span className="flex items-center gap-2">
                        <StockDot level={coverage.level} />
                        <span className="font-medium text-slate-800">{name}</span>
                      </span>
                      {consumable?.is_active === false && <span className="mt-0.5 block text-xs text-amber-800">Inativo no inventário</span>}
                      <span className="mt-1 block text-xs text-slate-600">{coverageText(coverage, consumable?.unit)}</span>
                      {atRisk && (
                        alternatives.length > 0 ? (
                          <span className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                            <span className="font-medium text-slate-700">Alternativas com stock:</span>
                            {alternatives.map((alternative) => (
                              <button
                                key={alternative.id}
                                type="button"
                                onClick={() => onReplace(item.consumable_id, alternative.id)}
                                disabled={disabled}
                                aria-label={`Substituir ${name} por ${alternative.name}`}
                                className="rounded-full border border-primary/30 bg-white px-3 py-1 font-medium text-primary hover:bg-sky-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-50"
                              >
                                Usar {alternative.name} ({formatQuantity(alternative.stock_quantity, alternative.unit)})
                              </button>
                            ))}
                          </span>
                        ) : (
                          <span className="mt-1 block text-xs text-slate-600">
                            Sem alternativas com stock {consumable?.category ? 'na mesma categoria' : 'com a mesma unidade'}
                            {hasMore ? ' entre os consumíveis carregados.' : ' no inventário.'}
                          </span>
                        )
                      )}
                    </td>
                    <td className="w-40 px-3 py-2">
                      <label htmlFor={inputId} className="sr-only">Quantidade necessária de {name}</label>
                      <div className="flex items-center gap-2">
                        <input
                          id={inputId}
                          type="number"
                          min="0"
                          step="any"
                          inputMode="decimal"
                          className={`${inputClass} mt-0`}
                          value={item.quantity}
                          onChange={(event) => onQuantityChange(item.consumable_id, event.target.value)}
                          disabled={disabled}
                          aria-invalid={error ? true : undefined}
                          aria-describedby={error ? `${inputId}-error` : undefined}
                        />
                        <span className="text-xs text-slate-600">{consumable?.unit ?? 'un'}</span>
                      </div>
                      {error && <p id={`${inputId}-error`} className="mt-1 text-xs text-red-700">{error}</p>}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 pt-4 text-slate-700">
                      {coverage.stock === null ? '—' : formatQuantity(coverage.stock, consumable?.unit)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => onRemove(item.consumable_id)}
                        disabled={disabled}
                        aria-label={`Remover ${name}`}
                        className="mt-1 rounded p-1.5 text-slate-600 hover:bg-red-50 hover:text-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-40"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </fieldset>
  )
}
