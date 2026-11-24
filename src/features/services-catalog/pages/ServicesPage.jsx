import { useMemo, useState } from 'react'
import ErrorAlert from '../../../shared/components/ErrorAlert'
import LoadingSpinner from '../../../shared/components/LoadingSpinner'
import ServiceFormModal from '../components/ServiceFormModal'
import ServicesTable from '../components/ServicesTable'
import useServicesCatalog from '../hooks/useServicesCatalog'
import { SERVICE_CATEGORIES } from '../utils/serviceForm'

const PAGE_SIZE = 7

function MetricCard({ label, value, badge, footnote, icon, accent = 'bg-blue-50 text-primary', tone = 'bg-sky-50' }) {
  return (
    <article className="relative min-h-[108px] overflow-hidden rounded-lg border border-slate-100 bg-white p-3 shadow-sm sm:p-4">
      <div className={`absolute bottom-0 right-0 h-16 w-16 rounded-tl-2xl ${tone}`} aria-hidden="true" />
      <div className="relative z-10 flex items-start justify-between gap-2"><p className="pt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-md ${accent}`} aria-hidden="true">{icon}</span></div>
      <div className="relative z-10 mt-1 flex flex-wrap items-center gap-1.5"><p className="text-2xl font-bold tracking-tight text-slate-900">{value}</p>{badge && <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold text-sky-800">{badge}</span>}</div>
      <div className="relative z-10 mt-1 flex items-start gap-1.5 text-xs leading-snug text-slate-600"><span className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true">{footnote.icon}</span><span>{footnote.text}</span></div>
    </article>
  )
}

function MetricIcon({ children, color = 'currentColor' }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">{children}</svg>
}

function exportCatalog(services) {
  const columns = ['Código', 'Serviço', 'Descrição', 'Categoria', 'Duração (minutos)', 'Químicos / peças', 'Preço base (€)', 'IVA incluído', 'Estado', 'Elegível para IoT']
  const rows = services.map((service) => [
    service.code,
    service.name,
    service.description,
    SERVICE_CATEGORIES.find(({ value }) => value === service.category)?.label ?? service.category,
    service.estimated_duration_minutes,
    service.included_items,
    service.base_price,
    service.vat_included ? 'Sim' : 'Não',
    service.is_active === false ? 'Inativo' : 'Ativo',
    service.is_iot_enabled ? 'Sim' : 'Não',
  ])
  const csv = [columns, ...rows]
    .map((row) => row.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(';'))
    .join('\r\n')
  const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'catalogo-servicos.csv'
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export default function ServicesPage() {
  const { services, loading, error, setError, saveService, setServiceActive } = useServicesCatalog()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [status, setStatus] = useState('all')
  const [sortOrder, setSortOrder] = useState('code-asc')
  const [page, setPage] = useState(1)
  const [editingService, setEditingService] = useState(null)
  const [formOpen, setFormOpen] = useState(false)

  const visibleServices = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('pt-PT')
    return services
      .filter((service) => {
        const matchesQuery = !query || [service.name, service.code, service.description]
          .some((value) => String(value ?? '').toLocaleLowerCase('pt-PT').includes(query))
        const matchesCategory = category === 'all' || service.category === category
        const matchesStatus = status === 'all' || (status === 'active' ? service.is_active !== false : service.is_active === false)
        return matchesQuery && matchesCategory && matchesStatus
      })
      .sort((first, second) => {
        if (sortOrder === 'price-asc') return (Number(first.base_price) || 0) - (Number(second.base_price) || 0)
        if (sortOrder === 'price-desc') return (Number(second.base_price) || 0) - (Number(first.base_price) || 0)
        return String(first.code ?? '').localeCompare(String(second.code ?? ''), 'pt-PT', { numeric: true })
      })
  }, [services, search, category, status, sortOrder])

  const activeCount = services.filter((service) => service.is_active !== false).length
  const inactiveCount = services.length - activeCount
  const catalogShare = services.length ? Math.round((activeCount / services.length) * 100) : null
  const pricedServices = services.filter((service) => (
    (typeof service.base_price === 'number' || (typeof service.base_price === 'string' && service.base_price.trim() !== ''))
      && Number.isFinite(Number(service.base_price))
      && Number(service.base_price) >= 0
  ))
  const averagePrice = pricedServices.length
    ? pricedServices.reduce((total, service) => total + Number(service.base_price), 0) / pricedServices.length
    : null
  const iotServiceCount = services.filter((service) => service.is_iot_enabled === true).length

  const pageCount = Math.max(1, Math.ceil(visibleServices.length / PAGE_SIZE))
  const pageServices = visibleServices.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const firstResult = visibleServices.length ? (page - 1) * PAGE_SIZE + 1 : 0
  const lastResult = Math.min(page * PAGE_SIZE, visibleServices.length)

  function openCreateForm() {
    setEditingService(null)
    setFormOpen(true)
  }

  function openEditForm(service) {
    setEditingService(service)
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditingService(null)
  }

  return (
    <div className="mx-auto max-w-[1500px] space-y-5 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <nav aria-label="Navegação estrutural" className="text-[11px] text-slate-500"><span>Painel</span><span className="mx-2">›</span><span>Gestão</span><span className="mx-2">›</span><span className="font-semibold text-primary">Serviços & Intervenções</span></nav>
      </div>
      <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div><div className="flex flex-wrap items-center gap-2"><h1 className="text-[26px] font-bold tracking-tight text-primary">Tipos de Intervenção</h1><span className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-semibold text-primary">{services.length} serviços registados</span><span className="rounded-full bg-cyan-100 px-2.5 py-1 text-[10px] font-semibold text-cyan-900">Catálogo ativo</span></div><p className="mt-1 max-w-3xl text-xs leading-relaxed text-slate-600">Configure o portfólio de serviços técnicos, planos de manutenção preventiva, telemetria IoT e parâmetros de faturação base para despachos no terreno.</p></div>
        <div className="flex shrink-0 flex-wrap gap-2"><button type="button" onClick={() => exportCatalog(services)} disabled={services.length === 0} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-primary shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"><span aria-hidden="true">⇩</span><span className="ml-2">Exportar catálogo</span></button><button type="button" onClick={openCreateForm} className="rounded-lg bg-[#00577b] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-dark"><span aria-hidden="true">⊕</span><span className="ml-2">Novo tipo de intervenção</span></button></div>
      </header>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Serviços ativos"
          value={activeCount}
          badge={catalogShare === null ? 'Catálogo vazio' : `${catalogShare}% do catálogo`}
          footnote={{ icon: '●', text: `${inactiveCount} ${inactiveCount === 1 ? 'serviço inativo' : 'serviços inativos'} no catálogo` }}
          icon={<MetricIcon><path d="m12 3 2.2 1.6 2.7-.1.8 2.6 2.2 1.6-1 2.5 1 2.5-2.2 1.6-.8 2.6-2.7-.1L12 20l-2.2-1.6-2.7.1-.8-2.6-2.2-1.6 1-2.5-1-2.5 2.2-1.6.8-2.6 2.7.1L12 3Z" /><path d="m9 12 2 2 4-4" /></MetricIcon>}
          tone="bg-sky-50"
        />
        <MetricCard
          label="Preço médio base"
          value={averagePrice === null ? '—' : new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(averagePrice)}
          badge={averagePrice === null ? 'Sem preços' : `${pricedServices.length} ${pricedServices.length === 1 ? 'serviço' : 'serviços'}`}
          footnote={{ icon: '☷', text: 'Média dos preços base registados no catálogo' }}
          icon={<MetricIcon color="#075985">
            <path d="M4 7.5v11h13.5" strokeWidth="2" />
            <rect x="6.5" y="4.5" width="14" height="13" rx="2.2" fill="currentColor" stroke="currentColor" />
            <path d="M9 7h9v8h-9z" fill="#dbeafe" stroke="none" />
            <path d="M9 7c0 1-.7 1.7-1.7 1.7M18 15c0-1 .7-1.7 1.7-1.7" stroke="#dbeafe" strokeWidth="1.2" />
            <circle cx="13.5" cy="11" r="2.6" fill="#fff" stroke="#dbeafe" strokeWidth=".7" />
            <text x="13.5" y="13" textAnchor="middle" fill="currentColor" stroke="none" fontSize="6.5" fontWeight="700">€</text>
          </MetricIcon>}
          accent="bg-blue-100 text-primary"
          tone="bg-indigo-50"
        />
        <MetricCard
          label="Intervenções este mês"
          value="—"
          badge="Indisponível"
          footnote={{ icon: '✓', text: 'Sem fonte de dados operacionais ligada' }}
          icon={<MetricIcon><rect x="4" y="5" width="16" height="16" rx="2" /><path d="M8 3v4M16 3v4M4 10h16M8 14h2M14 14h2M8 17h2" /></MetricIcon>}
          accent="bg-blue-100 text-sky-700"
          tone="bg-sky-50"
        />
        <MetricCard
          label="Com telemetria IoT"
          value={iotServiceCount}
          badge="Elegíveis"
          footnote={{ icon: '↟', text: 'Estado de sincronização indisponível' }}
          icon={<MetricIcon color="white"><path d="M8.5 8.5a5 5 0 0 0 0 7M15.5 8.5a5 5 0 0 1 0 7M5.5 5.5a9 9 0 0 0 0 13M18.5 5.5a9 9 0 0 1 0 13M12 11v2" /><circle cx="12" cy="12" r="1" /></MetricIcon>}
          accent="bg-teal-800 text-white"
          tone="bg-cyan-100"
        />
      </div>

      <section aria-label="Filtros do catálogo" className="grid gap-2 rounded-lg border border-slate-100 bg-white p-3 shadow-sm md:grid-cols-2 xl:grid-cols-[minmax(220px,1.2fr)_repeat(3,minmax(150px,1fr))]">
        <label className="relative block"><span className="sr-only">Pesquisar serviços</span><span aria-hidden="true" className="absolute left-3 top-2 text-slate-400">⌕</span><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Pesquisar por nome de serviço ou código" className="w-full rounded-md border border-transparent bg-blue-50 px-3 py-2 pl-8 text-[11px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" /></label>
        <label className="flex items-center gap-2 rounded-md bg-blue-50 px-3 text-[9px] text-slate-500"><span className="shrink-0 font-semibold uppercase">Categoria:</span><select value={category} onChange={(event) => { setCategory(event.target.value); setPage(1) }} className="min-w-0 flex-1 bg-transparent py-2 text-[11px] font-medium text-primary outline-none"><option value="all">Todas as Categorias</option>{SERVICE_CATEGORIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
        <label className="flex items-center gap-2 rounded-md bg-blue-50 px-3 text-[9px] text-slate-500"><span className="shrink-0 font-semibold uppercase">Estado:</span><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1) }} className="min-w-0 flex-1 bg-transparent py-2 text-[11px] font-medium text-primary outline-none"><option value="all">Todos</option><option value="active">Ativos</option><option value="inactive">Inativos</option></select></label>
        <label className="flex items-center gap-2 rounded-md bg-blue-50 px-3 text-[9px] text-slate-500"><span className="shrink-0 font-semibold uppercase">Ordenar:</span><select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} className="min-w-0 flex-1 bg-transparent py-2 text-[11px] font-medium text-primary outline-none"><option value="code-asc">Código (Crescente)</option><option value="price-asc">Preço (Crescente)</option><option value="price-desc">Preço (Decrescente)</option></select></label>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
        <ErrorAlert message={error} onClose={() => setError('')} />
        {loading ? <LoadingSpinner label="A carregar o catálogo de serviços…" /> : <>
          <ServicesTable services={pageServices} onEdit={openEditForm} onToggleActive={setServiceActive} />
          <footer className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/70 px-3 py-2 text-[10px] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>A mostrar {firstResult}–{lastResult} de {visibleServices.length} serviços registados</span>
            <div className="flex items-center justify-end gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="rounded-md px-3 py-1.5 font-medium hover:bg-white disabled:cursor-not-allowed disabled:opacity-40">Anterior</button><span className="px-2 font-semibold text-slate-700">{page} / {pageCount}</span><button type="button" disabled={page >= pageCount} onClick={() => setPage((current) => current + 1)} className="rounded-md px-3 py-1.5 font-medium hover:bg-white disabled:cursor-not-allowed disabled:opacity-40">Seguinte</button></div>
          </footer>
        </>}
      </section>

      {formOpen && <ServiceFormModal key={editingService?.id ?? 'new'} service={editingService} onClose={closeForm} onSave={saveService} />}
    </div>
  )
}
