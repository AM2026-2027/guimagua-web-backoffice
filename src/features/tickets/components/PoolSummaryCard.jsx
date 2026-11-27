import { Link } from 'react-router'
import { CARD_CLASS } from '../../../shared/components/uiClasses'

export default function PoolSummaryCard({ pool, clientId }) {
  if (!pool) {
    return (
      <section className={`${CARD_CLASS} p-5`} aria-labelledby="ticket-pool-title">
        <h2 id="ticket-pool-title" className="font-semibold text-slate-800">
          Piscina
        </h2>
        <p className="mt-2 text-sm text-slate-500">Os dados da piscina não estão disponíveis.</p>
      </section>
    )
  }

  const details = [
    { label: 'Dimensões', value: pool.dimensions },
    {
      label: 'Volume',
      value: Number.isFinite(pool.volume_m3) ? `${pool.volume_m3} m³` : null,
    },
    { label: 'Tratamento', value: pool.treatment_type },
    { label: 'Morada', value: pool.local_address },
  ]

  return (
    <section className={`${CARD_CLASS} space-y-4 p-5`} aria-labelledby="ticket-pool-title">
      <div>
        <h2 id="ticket-pool-title" className="font-semibold text-slate-800">
          Piscina
        </h2>
        <p className="mt-1 font-mono text-sm text-primary">Referência: {pool.id}</p>
        <p className="text-sm text-slate-600">{pool.name || 'Piscina registada'}</p>
      </div>

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        {details.map((item) => (
          <div key={item.label} className="min-w-0">
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{item.label}</dt>
            <dd className="mt-1 break-words text-slate-700">{item.value || '—'}</dd>
          </div>
        ))}
      </dl>
      <p className="text-xs text-slate-500">
        O revestimento e a data de instalação inicial não estão disponíveis no modelo atual.
      </p>
      {clientId && (
        <Link
          to={`/clients?client=${encodeURIComponent(clientId)}`}
          className="inline-flex text-sm font-medium text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          Ver Cadastro Completo
        </Link>
      )}
    </section>
  )
}
