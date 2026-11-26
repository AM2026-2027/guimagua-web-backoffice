import { formatTime } from '../utils/date'

function consumableName(line) {
  return line.consumable?.name ?? `Consumível ${line.consumable_id}`
}

/**
 * Avisos do protótipo "Novo agendamento":
 * - conflito de escala (bloqueia a gravação, RF-WEB04);
 * - risco de falta de material no stock projetado (avisa, mas deixa agendar, D-10).
 */
export default function SchedulingAlerts({ conflict, staffName, stockLines }) {
  const riskLines = stockLines.filter((line) => line.level === 'out_of_stock' || line.level === 'missing')
  if (!conflict && riskLines.length === 0) return null

  return (
    <div className="space-y-3">
      {conflict && (
        <div role="alert" className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-slate-700">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Conflito de escala</p>
          <p className="mt-1">
            <strong>{staffName ?? 'O colaborador'}</strong> já tem um serviço agendado das{' '}
            <strong>{formatTime(conflict.start)}</strong> às <strong>{formatTime(conflict.end)}</strong>.
            Escolha outro horário ou outro colaborador para poder gravar.
          </p>
        </div>
      )}
      {riskLines.length > 0 && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-slate-700">
          <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
            Risco de falta de material
          </p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            {riskLines.map((line) => (
              <li key={line.consumable_id}>
                {line.level === 'missing' ? (
                  <>
                    <strong>{consumableName(line)}</strong> não existe ou está inativo no inventário.
                  </>
                ) : (
                  <>
                    <strong>{consumableName(line)}</strong>: stock projetado {line.available}{' '}
                    {line.consumable?.unit ?? ''}, são precisos {line.quantity}.
                  </>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-slate-600">
            Pode agendar na mesma; o stock projetado fica negativo até haver reposição.
          </p>
        </div>
      )}
    </div>
  )
}
