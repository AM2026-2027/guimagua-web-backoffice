import StatusBadge from './StatusBadge'
import { CARD_CLASS, DANGER_BUTTON, PRIMARY_BUTTON, SECONDARY_BUTTON } from './styles'
import { formatClientNumber, formatDate, initialsOf } from '../utils/labels'

function Info({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-800">{children || '—'}</dd>
    </div>
  )
}

/** Cabeçalho da ficha do cliente (protótipo ficha-cliente): identificação, contactos e ações. */
export default function ClientHeader({ client, activePools, onEdit, onToggleActive, onAddPool }) {
  const active = client.is_active !== false
  const location = [client.postal_code, client.city].filter(Boolean).join(' ')

  return (
    <section className={`${CARD_CLASS} p-6`} aria-labelledby="client-title">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <span
            aria-hidden="true"
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary"
          >
            {initialsOf(client.name)}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-sky-50 px-2 py-0.5 text-xs font-semibold text-primary">
                {formatClientNumber(client.client_number)}
              </span>
              <StatusBadge active={active} activeLabel="Cliente ativo" inactiveLabel="Cliente inativo" />
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${
                  client.user_id ? 'bg-sky-50 text-primary ring-sky-200' : 'bg-amber-50 text-amber-800 ring-amber-200'
                }`}
              >
                {client.user_id ? 'Com conta na App Cliente' : 'Sem conta na App Cliente'}
              </span>
            </div>
            <h1 id="client-title" className="mt-2 text-2xl font-bold text-slate-800">
              {client.name}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {activePools === 1 ? '1 piscina ativa' : `${activePools} piscinas ativas`} · Cliente desde{' '}
              {formatDate(client.created_at)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onAddPool} disabled={!active} className={PRIMARY_BUTTON}>
            + Nova piscina
          </button>
          <button type="button" onClick={onEdit} className={SECONDARY_BUTTON}>
            Editar
          </button>
          <button type="button" onClick={onToggleActive} className={active ? DANGER_BUTTON : SECONDARY_BUTTON}>
            {active ? 'Desativar' : 'Reativar'}
          </button>
        </div>
      </div>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Info label="Telefone">
          {client.phone && (
            <a href={`tel:${client.phone}`} className="text-primary hover:underline">
              {client.phone}
            </a>
          )}
        </Info>
        <Info label="Email">
          {client.email && (
            <a href={`mailto:${client.email}`} className="break-all text-primary hover:underline">
              {client.email}
            </a>
          )}
        </Info>
        <Info label="NIF">{client.nif}</Info>
        <Info label="Última atualização">{formatDate(client.updated_at)}</Info>
        <div className="sm:col-span-2">
          <Info label="Morada de faturação">{[client.address, location].filter(Boolean).join(', ')}</Info>
        </div>
        <div className="sm:col-span-2">
          <Info label="Notas">{client.notes}</Info>
        </div>
      </dl>
    </section>
  )
}
