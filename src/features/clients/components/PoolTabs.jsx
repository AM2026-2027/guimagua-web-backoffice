import { formatVolume, poolTypeLabel } from '../utils/labels'
import { poolDisplayName } from '../utils/poolForm'

/** Separadores das piscinas do cliente (protótipo ficha-cliente). `pools` já vem ordenado. */
export default function PoolTabs({ pools, selectedId, onSelect, onAdd, canAdd }) {
  return (
    <div className="flex flex-wrap items-stretch gap-2" role="tablist" aria-label="Piscinas do cliente">
      {pools.map((pool, index) => {
        const selected = pool.id === selectedId
        const inactive = pool.is_active === false
        return (
          <button
            key={pool.id}
            type="button"
            role="tab"
            id={`pool-tab-${pool.id}`}
            aria-selected={selected}
            aria-controls="pool-panel"
            onClick={() => onSelect(pool.id)}
            className={`rounded-xl border px-4 py-2 text-left text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
              selected ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            } ${inactive ? 'opacity-60' : ''}`}
          >
            <span className="block font-medium">
              {poolDisplayName(pool, index)}
              {inactive && <span className="ml-2 text-xs font-normal text-slate-500">(inativa)</span>}
            </span>
            <span className="block text-xs text-slate-500">
              {[pool.pool_type ? poolTypeLabel(pool.pool_type) : null, formatVolume(pool.volume_m3)].filter(Boolean).join(' · ')}
            </span>
          </button>
        )
      })}
      {canAdd && (
        <button
          type="button"
          onClick={onAdd}
          className="rounded-xl border border-dashed border-slate-300 px-4 py-2 text-sm font-medium text-primary hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          + Adicionar piscina
        </button>
      )}
    </div>
  )
}
