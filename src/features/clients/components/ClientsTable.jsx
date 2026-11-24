import { Link } from 'react-router'
import StatusBadge from '../../../shared/components/StatusBadge'
import { CARD_CLASS, LINK_BUTTON, LINK_DANGER_BUTTON } from '../../../shared/components/uiClasses'
import { formatClientNumber, formatVolume, initialsOf, poolTypeLabel } from '../utils/labels'
import { poolDisplayName, sortPools } from '../utils/poolForm'

function PoolsSummary({ pools }) {
  const active = sortPools(pools).filter((pool) => pool.is_active !== false)
  if (active.length === 0) return <span className="text-slate-400">Sem piscinas</span>
  const [first, ...rest] = active
  return (
    <div>
      <div className="font-medium text-slate-700">{poolDisplayName(first, 0)}</div>
      <div className="text-xs text-slate-500">
        {formatVolume(first.volume_m3)}
        {first.pool_type ? ` · ${poolTypeLabel(first.pool_type)}` : ''}
        {rest.length > 0 ? ` · +${rest.length} piscina${rest.length > 1 ? 's' : ''}` : ''}
      </div>
    </div>
  )
}

/** Tabela apresentacional: dados e callbacks chegam por props. */
export default function ClientsTable({ clients, poolsByClient, onEdit, onToggleActive }) {
  return (
    <div className={`${CARD_CLASS} overflow-x-auto`}>
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <caption className="sr-only">Lista de clientes</caption>
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th scope="col" className="px-4 py-3">N.º</th>
            <th scope="col" className="px-4 py-3">Cliente</th>
            <th scope="col" className="px-4 py-3">Contactos</th>
            <th scope="col" className="px-4 py-3">Morada</th>
            <th scope="col" className="px-4 py-3">Piscinas</th>
            <th scope="col" className="px-4 py-3">Estado</th>
            <th scope="col" className="px-4 py-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {clients.map((client) => {
            const active = client.is_active !== false
            return (
              <tr key={client.id} className={active ? '' : 'bg-slate-50/60 text-slate-500'}>
                <td className="whitespace-nowrap px-4 py-3">
                  <span className="rounded-md bg-sky-50 px-2 py-0.5 text-xs font-semibold text-primary">
                    {formatClientNumber(client.client_number)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
                    >
                      {initialsOf(client.name)}
                    </span>
                    <div>
                      <Link to={{ search: `?client=${client.id}` }} className="font-medium text-slate-800 hover:text-primary hover:underline">
                        {client.name}
                      </Link>
                      {client.nif && <div className="text-xs text-slate-500">NIF {client.nif}</div>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-slate-700">{client.email}</div>
                  <div className="text-xs text-slate-500">{client.phone}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-slate-700">{client.address}</div>
                  <div className="text-xs text-slate-500">
                    {[client.postal_code, client.city].filter(Boolean).join(' ') || '—'}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <PoolsSummary pools={poolsByClient.get(client.id) ?? []} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge active={active} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <Link to={{ search: `?client=${client.id}` }} className={LINK_BUTTON} aria-label={`Ver ficha de ${client.name}`}>
                      Ver
                    </Link>
                    <button type="button" onClick={() => onEdit(client)} className={LINK_BUTTON} aria-label={`Editar ${client.name}`}>
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleActive(client)}
                      className={active ? LINK_DANGER_BUTTON : LINK_BUTTON}
                      aria-label={`${active ? 'Desativar' : 'Reativar'} ${client.name}`}
                    >
                      {active ? 'Desativar' : 'Reativar'}
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
