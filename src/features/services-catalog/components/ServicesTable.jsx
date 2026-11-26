import { formatDuration, formatPrice } from '../utils/format'
import { serviceTypeLabel } from '../utils/labels'
import { formatQuantity, stockCoverage } from '../utils/stock'
import StockDot from './StockDot'

const TYPE_STYLES = {
  maintenance: 'bg-sky-100 text-primary',
  repair: 'bg-amber-100 text-amber-900',
  commercial_survey: 'bg-violet-100 text-violet-900',
}

function TypeIcon({ type }) {
  const paths = {
    maintenance: <><path d="M8 4v8M16 4v8M6 12h12v3a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4z" /><path d="M12 19v2" /></>,
    repair: <path d="M14.5 6.5a4 4 0 0 0-5.3 5.3L4 17l3 3 5.2-5.2a4 4 0 0 0 5.3-5.3l-2.4 2.4-3-3z" />,
    commercial_survey: <><path d="M9 4h6l1 2h3v14H5V6h3z" /><path d="m9 13 2 2 4-4" /></>,
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      {paths[type] ?? <circle cx="12" cy="12" r="6" />}
    </svg>
  )
}

function ServiceRow({ service, consumablesById, notFoundIds, pending, onEdit, onToggleActive }) {
  const active = service.is_active !== false
  const checklistCount = (service.checklist_template ?? []).length
  const consumablesCount = (service.base_consumables ?? []).length

  return (
    <tr className="border-t border-slate-100 align-middle hover:bg-slate-50">
      <td className="px-4 py-3">
        <div className="flex items-start gap-3">
          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-md ${active ? 'bg-sky-100 text-primary' : 'bg-slate-100 text-slate-500'}`}>
            <TypeIcon type={service.type} />
          </span>
          <div className="min-w-0">
            <span className={`block text-sm font-semibold leading-tight ${active ? 'text-primary' : 'text-slate-600'}`}>
              {service.name || 'Serviço sem nome'}
            </span>
            {service.description && <span className="mt-1 block max-w-xs truncate text-xs text-slate-600" title={service.description}>{service.description}</span>}
            <span className="mt-1 block text-xs text-slate-600">
              {checklistCount} {checklistCount === 1 ? 'passo' : 'passos'} de checklist
            </span>
          </div>
        </div>
      </td>
      <td className="px-3 py-3">
        <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${active ? (TYPE_STYLES[service.type] ?? 'bg-slate-100 text-slate-700') : 'bg-slate-100 text-slate-600'}`}>
          {serviceTypeLabel(service.type)}
        </span>
      </td>
      <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-700">{formatDuration(service.default_duration_min)}</td>
      <td className="px-3 py-3 text-xs text-slate-700">
        {consumablesCount === 0 ? (
          <span className="text-slate-600">Nenhum</span>
        ) : (
          <ul className="space-y-1">
            {service.base_consumables.map((item) => {
              const consumable = consumablesById.get(item.consumable_id)
              const coverage = stockCoverage(consumable, item.quantity)
              const name = consumable?.name
                ?? (notFoundIds.includes(item.consumable_id) ? 'Consumível não encontrado' : 'A carregar…')
              return (
                <li key={item.consumable_id} className="flex items-center gap-2">
                  <StockDot level={coverage.level} />
                  <span className="min-w-0">
                    <span className="font-medium text-slate-800">{name}</span>
                    {' · '}
                    {formatQuantity(item.quantity, consumable?.unit)}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </td>
      <td className="whitespace-nowrap px-3 py-3">
        <span className="block text-sm font-bold text-primary">{formatPrice(service.base_price)}</span>
      </td>
      <td className="whitespace-nowrap px-3 py-3">
        <span className="inline-flex items-center gap-2">
          <button
            type="button"
            role="switch"
            aria-checked={active}
            aria-label={`Serviço ${service.name} ativo`}
            disabled={pending}
            onClick={() => onToggleActive(service)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60 ${active ? 'bg-primary' : 'bg-slate-300'}`}
          >
            <span className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${active ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </button>
          <span className={`text-xs font-medium ${active ? 'text-primary' : 'text-slate-600'}`}>{active ? 'Ativo' : 'Inativo'}</span>
        </span>
      </td>
      <td className="whitespace-nowrap px-3 py-3 text-right">
        <button
          type="button"
          onClick={() => onEdit(service)}
          aria-label={`Editar ${service.name}`}
          title="Editar"
          className="rounded p-1.5 text-slate-500 hover:bg-sky-50 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true"><path d="m15 5 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16z" /></svg>
        </button>
      </td>
    </tr>
  )
}

export default function ServicesTable({ services, consumablesById, notFoundIds, pendingIds, onEdit, onToggleActive }) {
  if (services.length === 0) {
    return (
      <div className="px-6 py-14 text-center">
        <p className="font-semibold text-slate-700">Não foram encontrados serviços</p>
        <p className="mt-1 text-sm text-slate-600">Ajuste a pesquisa ou adicione um novo tipo de intervenção.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] text-left">
        <caption className="sr-only">Catálogo de serviços</caption>
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
          <tr>
            <th scope="col" className="w-[32%] px-4 py-3 font-semibold">Serviço técnico</th>
            <th scope="col" className="px-3 py-3 font-semibold">Tipo</th>
            <th scope="col" className="px-3 py-3 font-semibold">Duração est.</th>
            <th scope="col" className="px-3 py-3 font-semibold">Produtos obrigatórios <span className="normal-case">(por intervenção)</span></th>
            <th scope="col" className="px-3 py-3 font-semibold">Preço base <span className="normal-case">(IVA incl.)</span></th>
            <th scope="col" className="px-3 py-3 font-semibold">Estado</th>
            <th scope="col" className="px-3 py-3 text-right font-semibold">Ações</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service) => (
            <ServiceRow
              key={service.id}
              service={service}
              consumablesById={consumablesById}
              notFoundIds={notFoundIds}
              pending={pendingIds.includes(service.id)}
              onEdit={onEdit}
              onToggleActive={onToggleActive}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
