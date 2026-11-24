import { useState } from 'react'
import { SERVICE_CATEGORIES } from '../utils/serviceForm'

function formatDuration(minutes) {
  if (!Number.isFinite(Number(minutes)) || Number(minutes) <= 0) return '—'
  const hours = Math.floor(Number(minutes) / 60)
  const remainingMinutes = Number(minutes) % 60
  if (hours === 0) return `${remainingMinutes} min`
  return `${hours}h${remainingMinutes ? ` ${String(remainingMinutes).padStart(2, '0')}m` : ' 00m'}`
}

function formatPrice(price) {
  if (price === null || price === undefined || price === '' || !Number.isFinite(Number(price))) return '—'
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(Number(price))
}

function ServiceIcon({ service }) {
  const paths = {
    chemical_treatment: <><path d="M9 3h6M10 3v6.5l-4.5 7A2 2 0 0 0 7.2 20h9.6a2 2 0 0 0 1.7-3.5l-4.5-7V3" /><path d="M8 15h8" /></>,
    periodic_maintenance: <><path d="M8 4v8M16 4v8M6 12h12v3a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4z" /><path d="M12 19v2" /></>,
    iot_hardware: <><path d="M8 8a5.5 5.5 0 0 0 0 8M16 8a5.5 5.5 0 0 1 0 8M5 5a9.5 9.5 0 0 0 0 14M19 5a9.5 9.5 0 0 1 0 14" /><circle cx="12" cy="12" r="1.2" fill="currentColor" /></>,
    hydraulic_repair: <><path d="M14.5 6.5a4 4 0 0 0-5.3 5.3L4 17l3 3 5.2-5.2a4 4 0 0 0 5.3-5.3l-2.4 2.4-3-3z" /></>,
    seasonal_diagnostics: <><path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M8 4.5l4 2.3 4-2.3M8 19.5l4-2.3 4 2.3M3.8 11l.4 4.6-4.1 2.3M20.2 11l-.4 4.6 4.1 2.3" transform="translate(0 -2)" /></>,
  }
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">{paths[service.category] ?? <><path d="M14 6 6 14M9 5l5 1 5 5-1 5-5 3-6-6z" /><circle cx="15.5" cy="8.5" r="1" /></>}</svg>
}

function ServiceRow({ service, onEdit, onToggleActive }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const category = SERVICE_CATEGORIES.find(({ value }) => value === service.category)
  const active = service.is_active !== false
  const categoryStyle = service.category === 'iot_hardware'
    ? 'bg-cyan-100 text-cyan-900'
    : service.is_active === false
      ? 'bg-slate-100 text-slate-600'
      : 'bg-blue-100 text-primary'

  return (
    <tr className="align-middle border-t border-slate-50 hover:bg-slate-50/60">
      <td className="px-3 py-3">
        <div className="grid grid-cols-[32px_26px_minmax(140px,1fr)] items-start gap-2">
          <span className={`grid h-8 w-8 place-items-center rounded-md ${service.category === 'iot_hardware' ? 'bg-teal-800 text-white' : active ? 'bg-blue-100 text-primary' : 'bg-slate-100 text-slate-500'}`} aria-hidden="true"><ServiceIcon service={service} /></span>
          <span className="pt-1 text-[9px] font-semibold text-slate-500">{service.code || '—'}</span>
          <div className="min-w-0"><span className={`block text-xs font-semibold leading-tight ${active ? 'text-primary' : 'text-slate-600'}`}>{service.name || 'Serviço sem nome'}</span>{service.description && <span className="mt-1 block max-w-[190px] truncate text-[10px] text-slate-500">{service.description}</span>}{service.is_iot_enabled && <span className="mt-1 inline-block rounded-sm bg-sky-400 px-1.5 py-0.5 text-[8px] font-bold text-sky-950">IoT</span>}</div>
        </div>
      </td>
      <td className="px-2 py-3"><span className={`whitespace-nowrap rounded-full px-2 py-1 text-[9px] font-medium ${categoryStyle}`}>{category?.label ?? service.category ?? '—'}</span></td>
      <td className="whitespace-nowrap px-2 py-3 text-[10px] text-slate-600"><span className="mr-1 text-slate-500" aria-hidden="true">◷</span>{formatDuration(service.estimated_duration_minutes)}</td>
      <td className="max-w-36 px-2 py-3 text-[10px] text-slate-700"><span className="mr-1 text-sky-700" aria-hidden="true">●</span>{service.included_items || '—'}</td>
      <td className="whitespace-nowrap px-2 py-3"><span className="block text-xs font-bold text-primary">{formatPrice(service.base_price)}</span><span className="block text-[9px] text-slate-500">{service.vat_included ? 'IVA incluído' : '+ IVA tabelado'}</span></td>
      <td className="whitespace-nowrap px-2 py-3"><button type="button" role="switch" aria-checked={active} aria-label={`${active ? 'Desativar' : 'Ativar'} ${service.name}`} onClick={() => onToggleActive(service)} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${active ? 'bg-[#00577b]' : 'bg-slate-300'}`}><span className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${active ? 'translate-x-4' : 'translate-x-0.5'}`} /></button><span className={`ml-1.5 text-[9px] font-medium ${active ? 'text-primary' : 'text-slate-500'}`}>{active ? 'Ativo' : 'Inativo'}</span></td>
      <td className="whitespace-nowrap px-2 py-3 text-right">
        <button type="button" onClick={() => onEdit(service)} aria-label={`Editar ${service.name}`} title="Editar" className="rounded p-1.5 text-slate-500 hover:bg-blue-50 hover:text-primary"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m15 5 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16z" /></svg></button>
        <span className="relative inline-block">
          <button type="button" aria-label={`Mais ações para ${service.name}`} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)} className="rounded p-1.5 text-slate-500 hover:bg-slate-100"><svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" /></svg></button>
          {menuOpen && <div role="menu" className="absolute right-0 top-full z-20 min-w-32 rounded-md border border-slate-200 bg-white p-1 text-left shadow-lg"><button type="button" role="menuitem" onClick={() => { setMenuOpen(false); onEdit(service) }} className="block w-full rounded px-2 py-1.5 text-[10px] text-slate-700 hover:bg-slate-50">Editar serviço</button><button type="button" role="menuitem" onClick={() => { setMenuOpen(false); onToggleActive(service) }} className="block w-full rounded px-2 py-1.5 text-[10px] text-slate-700 hover:bg-slate-50">{active ? 'Desativar serviço' : 'Ativar serviço'}</button></div>}
        </span>
      </td>
    </tr>
  )
}

export default function ServicesTable({ services, onEdit, onToggleActive }) {
  if (services.length === 0) {
    return <div className="px-6 py-14 text-center"><p className="font-semibold text-slate-700">Não foram encontrados serviços</p><p className="mt-1 text-sm text-slate-500">Ajuste a pesquisa ou adicione um novo tipo de intervenção.</p></div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[850px] text-left">
        <thead className="bg-[#f5f7ff] text-[9px] uppercase tracking-wide text-slate-500">
          <tr><th className="w-[27%] px-3 py-3 font-semibold">Serviço técnico</th><th className="px-2 py-3 font-semibold">Categoria</th><th className="px-2 py-3 font-semibold">Duração est.</th><th className="px-2 py-3 font-semibold">Químicos / peças</th><th className="px-2 py-3 font-semibold">Preço base</th><th className="px-2 py-3 font-semibold">Estado</th><th className="px-2 py-3 text-right font-semibold">Ações</th></tr>
        </thead>
        <tbody>{services.map((service) => <ServiceRow key={service.id} service={service} onEdit={onEdit} onToggleActive={onToggleActive} />)}</tbody>
      </table>
    </div>
  )
}
