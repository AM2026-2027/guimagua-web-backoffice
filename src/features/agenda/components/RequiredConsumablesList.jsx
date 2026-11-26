const LEVEL_STYLES = {
  ok: { label: 'Disponível', className: 'text-emerald-700' },
  low_stock: { label: 'Stock baixo', className: 'text-amber-700' },
  out_of_stock: { label: 'Sem stock', className: 'text-red-700' },
  missing: { label: 'Indisponível', className: 'text-red-700' },
}

/** Consumíveis previstos pelo serviço, com o stock projetado de cada um (só leitura). */
export default function RequiredConsumablesList({ lines, loading, error }) {
  return (
    <section aria-labelledby="appointment-consumables-title">
      <h3 id="appointment-consumables-title" className="text-sm font-medium text-slate-700">
        Peças, químicos e consumíveis previstos
      </h3>
      {loading ? (
        <p className="mt-1 text-xs text-slate-500">A consultar o stock...</p>
      ) : error ? (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      ) : lines.length === 0 ? (
        <p className="mt-1 text-xs text-slate-500">Este serviço não prevê consumíveis.</p>
      ) : (
        <ul className="mt-2 divide-y divide-slate-100 rounded-xl border border-slate-200">
          {lines.map((line) => {
            const level = LEVEL_STYLES[line.level]
            const unit = line.consumable?.unit ?? ''
            return (
              <li
                key={line.consumable_id}
                className={`flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm ${
                  line.level === 'out_of_stock' || line.level === 'missing' ? 'bg-red-50' : ''
                }`}
              >
                <span className="font-medium text-slate-800">
                  {line.consumable?.name ?? `Consumível ${line.consumable_id}`}
                </span>
                <span className="flex items-center gap-3 text-xs">
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-700">
                    × {line.quantity} {unit}
                  </span>
                  <span className={`font-medium ${level.className}`}>
                    {level.label}
                    {line.level !== 'missing' && ` (projetado: ${line.available} ${unit})`}
                  </span>
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
