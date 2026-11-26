import { useCallback, useState } from 'react'
import LoadingSpinner from '../../../shared/components/LoadingSpinner'
import ErrorAlert from '../../../shared/components/ErrorAlert'
import ConfirmDialog from '../../../shared/components/ConfirmDialog'
import Notice from '../../../shared/components/Notice'
import { CARD_CLASS, PRIMARY_BUTTON, SECONDARY_BUTTON } from '../../../shared/components/uiClasses'
import { useInventory } from '../hooks/useInventory'
import { useCommittedStock } from '../hooks/useCommittedStock'
import ConsumableFormModal from '../components/ConsumableFormModal'
import InventoryStats from '../components/InventoryStats'
import InventoryTable from '../components/InventoryTable'
import InventoryToolbar from '../components/InventoryToolbar'
import StockAdjustDialog from '../components/StockAdjustDialog'
import { formatQuantity, normalizeText } from '../utils/labels'
import { projectedStock, stockStatus } from '../utils/stock'

/**
 * Inventário & Stock (RF-WEB03, US03, US09, D-10): stock físico, comprometido e projetado.
 * O estado vive aqui; os componentes são apresentacionais.
 */
export default function InventoryPage() {
  const [notice, setNotice] = useState('')
  const clearNotice = useCallback(() => setNotice(''), [])
  const inventory = useInventory({
    onCreated: (consumable) => setNotice(`Artigo ${consumable.name} criado com o SKU ${consumable.sku}.`),
  })
  const stock = useCommittedStock()

  const [category, setCategory] = useState('all')
  // Filtro dos cartões de totais: null | 'committed' (comprometidos com visitas) | 'alerts' (stock baixo ou sem stock).
  const [statFilter, setStatFilter] = useState(null)
  const [showInactive, setShowInactive] = useState(false)
  // { consumable: null } = criar; { consumable } = editar.
  const [formTarget, setFormTarget] = useState(null)
  const [adjustTarget, setAdjustTarget] = useState(null)
  const [confirmTarget, setConfirmTarget] = useState(null)

  // Estado derivado: comprometido, projetado e estado de cada artigo, filtros e ordenação.
  const rows = inventory.items.map((item) => {
    const committed = stock.committed.get(item.id) ?? 0
    const projected = projectedStock(item, committed)
    return { item, committed, projected, status: stockStatus(item, projected) }
  })
  const term = normalizeText(inventory.searchTerm)
  const visibleRows = rows
    .filter(({ item }) => showInactive || item.is_active !== false)
    .filter(({ item }) => category === 'all' || item.category === category)
    .filter(({ status }) => statFilter !== 'alerts' || status === 'low_stock' || status === 'out_of_stock')
    .filter(({ committed }) => statFilter !== 'committed' || committed > 0)
    .filter(({ item }) => !term || [item.name, item.sku, item.supplier, item.description].some((value) => normalizeText(value).includes(term)))
    .toSorted((a, b) => normalizeText(a.item.name).localeCompare(normalizeText(b.item.name), 'pt-PT'))

  const activeRows = rows.filter(({ item }) => item.is_active !== false)
  const stats = {
    activeCount: inventory.activeCount,
    inStock: activeRows.filter(({ status }) => status === 'in_stock').length,
    committedItems: stock.loaded ? activeRows.filter(({ committed }) => committed > 0).length : null,
    appointmentsCount: stock.loaded && !stock.error ? stock.appointmentsCount : null,
    alerts: activeRows.filter(({ status }) => status === 'low_stock' || status === 'out_of_stock').length,
    partial: inventory.hasMore,
  }

  function openForm(target) {
    inventory.clearActionError()
    setFormTarget(target)
  }

  async function handleSubmit(payload) {
    const editing = formTarget?.consumable
    const ok = editing ? await inventory.update(editing, payload) : await inventory.create(payload)
    if (ok) {
      setFormTarget(null)
      if (editing) setNotice(`Artigo ${payload.name} guardado.`)
    }
    return ok
  }

  async function handleAdjust(delta, reason) {
    const target = adjustTarget
    const ok = await inventory.adjustStock(target, delta, reason)
    if (ok) {
      setAdjustTarget(null)
      setNotice(`${delta > 0 ? 'Entrada' : 'Saída'} de ${formatQuantity(Math.abs(delta), target.unit)} registada em ${target.name} e guardada no histórico de movimentos.`)
    }
    return ok
  }

  async function handleConfirm() {
    const target = confirmTarget
    const activate = target.is_active === false
    const ok = await inventory.setActive(target, activate)
    if (ok) {
      setConfirmTarget(null)
      setNotice(`Artigo ${target.name} ${activate ? 'reativado' : 'inativado'}.`)
    }
    return ok
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Diretório de inventário & stock</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-800">Gestão de Inventário & Equipamentos</h1>
          <p className="mt-1 text-sm text-slate-500">Stock físico, comprometido com visitas agendadas e projetado de consumíveis, químicos e peças.</p>
        </div>
        <button type="button" onClick={() => openForm({ consumable: null })} className={PRIMARY_BUTTON}>
          + Novo artigo
        </button>
      </div>

      <Notice message={notice} onClose={clearNotice} />

      <InventoryStats
        {...stats}
        activeFilter={statFilter}
        onToggleFilter={(filter) => setStatFilter((current) => (current === filter ? null : filter))}
      />

      <InventoryToolbar
        searchTerm={inventory.searchTerm}
        onSearchChange={inventory.setSearchTerm}
        category={category}
        onCategoryChange={setCategory}
        showInactive={showInactive}
        onShowInactiveChange={setShowInactive}
      />

      {statFilter && (
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <span>
            A mostrar só{' '}
            <strong>{statFilter === 'alerts' ? 'artigos com stock baixo ou sem stock' : 'artigos comprometidos com visitas agendadas'}</strong>.
          </span>
          <button type="button" onClick={() => setStatFilter(null)} className="font-medium text-primary hover:underline">
            Limpar filtro
          </button>
        </div>
      )}

      {stock.error && <ErrorAlert message={stock.error} />}
      {!formTarget && !adjustTarget && !confirmTarget && <ErrorAlert message={inventory.actionError} onClose={inventory.clearActionError} />}

      {inventory.loading ? (
        <LoadingSpinner label="A carregar inventário..." />
      ) : inventory.error ? (
        <div className="space-y-3">
          <ErrorAlert message={inventory.error} />
          <button type="button" onClick={inventory.reload} className={SECONDARY_BUTTON}>
            Tentar novamente
          </button>
        </div>
      ) : visibleRows.length === 0 ? (
        <div className={`${CARD_CLASS} p-8 text-center text-sm text-slate-500`}>
          {inventory.items.length === 0 ? 'Ainda não há artigos registados.' : 'Nenhum artigo corresponde aos filtros.'}
        </div>
      ) : (
        <InventoryTable
          rows={visibleRows}
          committedLoaded={stock.loaded}
          onAdjust={(item) => {
            inventory.clearActionError()
            setAdjustTarget(item)
          }}
          onEdit={(item) => openForm({ consumable: item })}
          onToggleActive={(item) => {
            inventory.clearActionError()
            setConfirmTarget(item)
          }}
        />
      )}

      {!inventory.loading && !inventory.error && (
        <div className="flex flex-col items-center gap-2 text-sm text-slate-500 sm:flex-row sm:justify-between">
          <span>
            A mostrar {visibleRows.length} de {inventory.items.length} artigo{inventory.items.length === 1 ? '' : 's'} carregado{inventory.items.length === 1 ? '' : 's'}
          </span>
          {inventory.hasMore && (
            <button type="button" onClick={inventory.loadMore} disabled={inventory.loadingMore} className={SECONDARY_BUTTON}>
              {inventory.loadingMore ? 'A carregar...' : 'Carregar mais'}
            </button>
          )}
        </div>
      )}

      {formTarget && (
        <ConsumableFormModal
          key={formTarget.consumable?.id ?? 'new-consumable'}
          consumable={formTarget.consumable}
          serverError={inventory.actionError}
          onDismissError={inventory.clearActionError}
          onSubmit={handleSubmit}
          onClose={() => setFormTarget(null)}
        />
      )}

      {adjustTarget && (
        <StockAdjustDialog
          key={adjustTarget.id}
          consumable={adjustTarget}
          serverError={inventory.actionError}
          onDismissError={inventory.clearActionError}
          onSubmit={handleAdjust}
          onClose={() => setAdjustTarget(null)}
        />
      )}

      {confirmTarget && (
        <ConfirmDialog
          title={confirmTarget.is_active === false ? 'Reativar artigo' : 'Inativar artigo'}
          message={
            confirmTarget.is_active === false
              ? `${confirmTarget.name} volta a estar disponível para serviços e agendamentos.`
              : `${confirmTarget.name} deixa de estar disponível para novos serviços e agendamentos. O artigo não é apagado: continua no histórico e pode ser reativado em "Ver artigos inativos".`
          }
          confirmLabel={confirmTarget.is_active === false ? 'Reativar' : 'Inativar'}
          danger={confirmTarget.is_active !== false}
          error={inventory.actionError}
          onDismissError={inventory.clearActionError}
          onConfirm={handleConfirm}
          onCancel={() => setConfirmTarget(null)}
        />
      )}
    </div>
  )
}
