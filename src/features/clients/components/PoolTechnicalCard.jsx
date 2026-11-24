import StatusBadge from './StatusBadge'
import { CARD_CLASS, LINK_BUTTON, LINK_DANGER_BUTTON } from './styles'
import { formatDate, formatVolume, poolTypeLabel, treatmentTypeLabel } from '../utils/labels'
import { poolDisplayName } from '../utils/poolForm'

function Spec({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-800">{children || '—'}</dd>
    </div>
  )
}

/** Ficha técnica da piscina (protótipos ficha-cliente e detalhe-piscina). */
export default function PoolTechnicalCard({ pool, index, onEdit, onToggleActive }) {
  const active = pool.is_active !== false
  const equipment = Array.isArray(pool.equipment) ? pool.equipment : []

  return (
    <section className={`${CARD_CLASS} p-6`} aria-labelledby="pool-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Ficha técnica</p>
          <h2 id="pool-title" className="mt-1 text-xl font-semibold text-slate-800">
            {poolDisplayName(pool, index)}
          </h2>
          <p className="mt-1 text-sm text-slate-500">{pool.local_address}</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge active={active} activeLabel="Ativa" inactiveLabel="Inativa" />
          <button type="button" onClick={onEdit} className={LINK_BUTTON}>
            Editar piscina
          </button>
          <button type="button" onClick={onToggleActive} className={active ? LINK_DANGER_BUTTON : LINK_BUTTON}>
            {active ? 'Desativar' : 'Reativar'}
          </button>
        </div>
      </div>

      <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Spec label="Tipo de piscina">{poolTypeLabel(pool.pool_type || 'other')}</Spec>
        <Spec label="Tratamento">{treatmentTypeLabel(pool.treatment_type)}</Spec>
        {/* Piscinas antigas podem ter só comprimento x largura; mostram-se tal como estão. */}
        <Spec label="Dimensões (C × L × A)">{pool.dimensions ? `${pool.dimensions.split('x').join(' m × ')} m` : null}</Spec>
        <Spec label="Volume">{formatVolume(pool.volume_m3)}</Spec>
      </dl>

      <div className="mt-5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Equipamentos instalados</h3>
        {equipment.length === 0 ? (
          <p className="mt-1 text-sm text-slate-400">Nenhum equipamento registado.</p>
        ) : (
          <ul className="mt-2 flex flex-wrap gap-2">
            {equipment.map((item) => (
              <li key={item} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>

      {pool.notes && (
        <div className="mt-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Notas técnicas</h3>
          <p className="mt-1 whitespace-pre-line text-sm text-slate-700">{pool.notes}</p>
        </div>
      )}

      <p className="mt-5 text-xs text-slate-400">Última atualização: {formatDate(pool.updated_at)}</p>
    </section>
  )
}
