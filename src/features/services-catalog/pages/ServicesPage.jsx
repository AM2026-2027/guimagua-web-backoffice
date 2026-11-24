import { useCallback, useMemo, useState } from 'react'
import ErrorAlert from '../../../shared/components/ErrorAlert'
import LoadingSpinner from '../../../shared/components/LoadingSpinner'
import ServiceFormModal from '../components/ServiceFormModal'
import ServicesTable from '../components/ServicesTable'
import StockAlertsCard from '../components/StockAlertsCard'
import { StockLegend } from '../components/StockDot'
import useConsumables from '../hooks/useConsumables'
import useServicesCatalog from '../hooks/useServicesCatalog'
import { buildCatalogCsv } from '../utils/catalogCsv'
import { formatPrice, hasValidPrice } from '../utils/format'
import { SERVICE_TYPES } from '../utils/labels'
import { STOCK_LEVEL, STOCK_LEVEL_LABELS, serviceStockLevel } from '../utils/stock'

const PAGE_SIZE = 7

function MetricCard({ label, value, badge, footnote, icon, accent = 'bg-sky-100 text-primary' }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="pt-1 text-xs font-semibold uppercase tracking-wide text-slate-600">{label}</p>
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-md ${accent}`} aria-hidden="true">{icon}</span>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <p className="text-2xl font-bold tracking-tight text-slate-900">{value}</p>
        {badge && <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-900">{badge}</span>}
      </div>
      <p className="mt-1 text-xs leading-snug text-slate-600">{footnote}</p>
    </article>
  )
}

function MetricIcon({ children }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">{children}</svg>
}

// Descarrega o CSV no browser (o conteúdo é gerado em utils/catalogCsv.js).
function downloadCatalog(services) {
  const url = URL.createObjectURL(new Blob([buildCatalogCsv(services)], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'catalogo-servicos.csv'
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function compareServices(sortOrder) {
  return (first, second) => {
    if (sortOrder === 'price-asc') return (Number(first.base_price) || 0) - (Number(second.base_price) || 0)
    if (sortOrder === 'price-desc') return (Number(second.base_price) || 0) - (Number(first.base_price) || 0)
    return String(first.name ?? '').localeCompare(String(second.name ?? ''), 'pt-PT')
  }
}

const filterSelectClass = 'min-w-0 flex-1 bg-transparent py-2 text-sm font-medium text-primary outline-none'
const filterLabelClass = 'flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 text-xs text-slate-600 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20'

export default function ServicesPage() {
  const { services, loading, error, clearError, reload, pendingIds, saveService, toggleServiceActive } = useServicesCatalog()
  const [search, setSearch] = useState('')
  const [type, setType] = useState('all')
  const [status, setStatus] = useState('all')
  const [sortOrder, setSortOrder] = useState('name-asc')
  // Filtro dos atalhos do card "Alertas de stock": 'all' | 'insufficient' | 'margin'.
  const [stockFilter, setStockFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [editingService, setEditingService] = useState(null)
  const [formOpen, setFormOpen] = useState(false)

  // Produtos obrigatórios de todos os serviços: lidos pelo id para o semáforo de stock da lista.
  // A lista completa de consumíveis (por páginas) só é lida quando o formulário abre.
  const referencedConsumableIds = useMemo(
    () => services.flatMap((service) => (service.base_consumables ?? []).map((item) => item.consumable_id)),
    [services],
  )
  const consumableOptions = useConsumables(formOpen, referencedConsumableIds)
  const consumablesById = useMemo(
    () => new Map(consumableOptions.consumables.map((consumable) => [consumable.id, consumable])),
    [consumableOptions.consumables],
  )

  // Filtros, ordenação e contadores são derivados na renderização (sem estado duplicado).
  const visibleServices = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('pt-PT')
    return services
      .filter((service) => {
        const matchesQuery = !query || [service.name, service.description]
          .some((value) => String(value ?? '').toLocaleLowerCase('pt-PT').includes(query))
        const matchesType = type === 'all' || service.type === type
        const matchesStatus = status === 'all' || (status === 'active' ? service.is_active !== false : service.is_active === false)
        const matchesStock = stockFilter === 'all' || serviceStockLevel(service, consumablesById) === stockFilter
        return matchesQuery && matchesType && matchesStatus && matchesStock
      })
      .toSorted(compareServices(sortOrder))
  }, [services, search, type, status, sortOrder, stockFilter, consumablesById])

  const activeCount = services.filter((service) => service.is_active !== false).length
  const inactiveCount = services.length - activeCount
  const catalogShare = services.length ? Math.round((activeCount / services.length) * 100) : null
  const pricedServices = services.filter(hasValidPrice)
  const averagePrice = pricedServices.length
    ? pricedServices.reduce((total, service) => total + service.base_price, 0) / pricedServices.length
    : null
  const stockLevels = services.map((service) => serviceStockLevel(service, consumablesById))
  const insufficientCount = stockLevels.filter((level) => level === STOCK_LEVEL.INSUFFICIENT).length
  const marginCount = stockLevels.filter((level) => level === STOCK_LEVEL.MARGIN).length

  const pageCount = Math.max(1, Math.ceil(visibleServices.length / PAGE_SIZE))
  // Se um filtro reduzir os resultados, a página atual nunca passa da última.
  const currentPage = Math.min(page, pageCount)
  const pageServices = visibleServices.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const firstResult = visibleServices.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0
  const lastResult = Math.min(currentPage * PAGE_SIZE, visibleServices.length)

  function openCreateForm() {
    setEditingService(null)
    setFormOpen(true)
  }

  function openEditForm(service) {
    setEditingService(service)
    setFormOpen(true)
  }

  const closeForm = useCallback(() => {
    setFormOpen(false)
    setEditingService(null)
  }, [])

  function applyStockFilter(level) {
    setStockFilter(level)
    setPage(1)
  }

  function updateFilter(setter) {
    return (event) => {
      setter(event.target.value)
      setPage(1)
    }
  }

  return (
    <div className="mx-auto max-w-[1500px] space-y-5 pb-8">
      <nav aria-label="Navegação estrutural" className="text-xs text-slate-600">
        <span>Painel</span><span className="mx-2" aria-hidden="true">›</span><span>Gestão</span><span className="mx-2" aria-hidden="true">›</span>
        <span className="font-semibold text-primary" aria-current="page">Serviços e intervenções</span>
      </nav>

      <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">Tipos de Intervenção</h1>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-600">
            Configure os tipos de intervenção, a checklist técnica, os produtos obrigatórios e os preços base.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => downloadCatalog(visibleServices)}
            disabled={visibleServices.length === 0}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-primary shadow-sm hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span aria-hidden="true">⇩</span><span className="ml-2">Exportar catálogo</span>
          </button>
          <button
            type="button"
            onClick={openCreateForm}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
          >
            <span aria-hidden="true">+</span><span className="ml-2">Novo tipo de intervenção</span>
          </button>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard
          label="Serviços ativos"
          value={activeCount}
          badge={catalogShare === null ? 'Catálogo vazio' : `${catalogShare}% do catálogo`}
          footnote={`${inactiveCount} ${inactiveCount === 1 ? 'serviço inativo' : 'serviços inativos'}`}
          icon={<MetricIcon><circle cx="12" cy="12" r="8" /><path d="m9 12 2 2 4-4" /></MetricIcon>}
        />
        <StockAlertsCard
          insufficientCount={insufficientCount}
          marginCount={marginCount}
          activeFilter={stockFilter}
          onFilter={applyStockFilter}
        />
        <MetricCard
          label="Preço médio base (IVA incl.)"
          value={averagePrice === null ? '—' : formatPrice(averagePrice)}
          badge={averagePrice === null ? 'Sem preços' : `${pricedServices.length} ${pricedServices.length === 1 ? 'serviço' : 'serviços'}`}
          footnote="Média dos preços base do catálogo"
          icon={<MetricIcon><rect x="3" y="6" width="18" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /></MetricIcon>}
        />
      </div>

      <section aria-label="Filtros do catálogo" className="grid gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm md:grid-cols-2 xl:grid-cols-[minmax(220px,1.2fr)_repeat(3,minmax(160px,1fr))]">
        <label className="relative block">
          <span className="sr-only">Pesquisar serviços</span>
          <span aria-hidden="true" className="absolute left-3 top-2 text-slate-500">⌕</span>
          <input
            type="search"
            value={search}
            onChange={updateFilter(setSearch)}
            placeholder="Pesquisar por nome ou descrição"
            className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 pl-8 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>
        <label className={filterLabelClass}>
          <span className="shrink-0 font-semibold uppercase">Tipo:</span>
          <select value={type} onChange={updateFilter(setType)} className={filterSelectClass}>
            <option value="all">Todos os tipos</option>
            {SERVICE_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
        <label className={filterLabelClass}>
          <span className="shrink-0 font-semibold uppercase">Estado:</span>
          <select value={status} onChange={updateFilter(setStatus)} className={filterSelectClass}>
            <option value="all">Todos</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
        </label>
        <label className={filterLabelClass}>
          <span className="shrink-0 font-semibold uppercase">Ordenar:</span>
          <select value={sortOrder} onChange={updateFilter(setSortOrder)} className={filterSelectClass}>
            <option value="name-asc">Nome (A–Z)</option>
            <option value="price-asc">Preço (crescente)</option>
            <option value="price-desc">Preço (decrescente)</option>
          </select>
        </label>
      </section>

      {stockFilter !== 'all' && (
        <p className="flex flex-wrap items-center gap-2 text-sm text-slate-700" aria-live="polite">
          <span>A mostrar só serviços com: <strong>{STOCK_LEVEL_LABELS[stockFilter].toLocaleLowerCase('pt-PT')}</strong></span>
          <button type="button" onClick={() => applyStockFilter('all')} className="rounded-full border border-slate-300 bg-white px-3 py-0.5 text-xs font-medium text-primary hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
            Limpar filtro ✕
          </button>
        </p>
      )}

      <section aria-label="Lista de serviços" className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {error && (
          <div className="space-y-2 p-3">
            <ErrorAlert message={error} onClose={clearError} />
            {services.length === 0 && !loading && (
              <button type="button" onClick={reload} className="text-sm font-medium text-primary hover:underline">Tentar novamente</button>
            )}
          </div>
        )}
        {loading ? <LoadingSpinner label="A carregar o catálogo de serviços…" /> : (
          <>
            <ServicesTable
              services={pageServices}
              consumablesById={consumablesById}
              notFoundIds={consumableOptions.notFoundIds}
              pendingIds={pendingIds}
              onEdit={openEditForm}
              onToggleActive={toggleServiceActive}
            />
            <StockLegend />
            <footer className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
              <span aria-live="polite">A mostrar {firstResult}–{lastResult} de {visibleServices.length} serviços</span>
              <nav aria-label="Paginação" className="flex items-center justify-end gap-2">
                <button type="button" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)} className="rounded-md px-3 py-1.5 font-medium hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-40">Anterior</button>
                <span className="px-2 font-semibold text-slate-700">{currentPage} / {pageCount}</span>
                <button type="button" disabled={currentPage >= pageCount} onClick={() => setPage(currentPage + 1)} className="rounded-md px-3 py-1.5 font-medium hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-40">Seguinte</button>
              </nav>
            </footer>
          </>
        )}
      </section>

      {formOpen && (
        <ServiceFormModal
          key={editingService?.id ?? 'new'}
          service={editingService}
          consumableOptions={consumableOptions}
          onClose={closeForm}
          onSave={saveService}
        />
      )}
    </div>
  )
}
