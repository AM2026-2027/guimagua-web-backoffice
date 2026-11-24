import { inputClass } from './FormField'

const iconButtonClass = 'rounded p-1.5 text-slate-600 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-40'

/**
 * Construtor da checklist técnica (protótipo "Editor de Serviço").
 * A ordem dos passos é a ordem pela qual o técnico os executa na app; reordena-se com os botões ↑/↓.
 */
export default function ChecklistEditor({ steps, errors, focusStepId, disabled, onAdd, onChange, onMove, onRemove }) {
  return (
    <fieldset className="rounded-xl border border-slate-200 p-4">
      <legend className="px-1 text-sm font-semibold text-slate-800">Procedimentos da checklist técnica</legend>
      <p className="mb-3 text-xs text-slate-600">
        A ordem dos passos é a ordem mostrada ao técnico na aplicação móvel.
      </p>

      {steps.length === 0 ? (
        <p className="rounded-lg bg-slate-50 px-3 py-4 text-center text-sm text-slate-600">Ainda não há passos na checklist.</p>
      ) : (
        <ol className="space-y-2">
          {steps.map((step, index) => {
            const inputId = `checklist-step-${step.id}`
            const error = errors[`checklist_template.${step.id}`]
            return (
              <li key={step.id} className="flex items-start gap-2">
                <span className="mt-2 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-white" aria-hidden="true">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <label htmlFor={inputId} className="sr-only">Passo {index + 1}</label>
                  <input
                    id={inputId}
                    className={`${inputClass} mt-0`}
                    value={step.text}
                    onChange={(event) => onChange(step.id, event.target.value)}
                    placeholder="Ex.: Medição de pH e cloro livre"
                    // Foco no passo acabado de adicionar, para se poder escrever logo.
                    autoFocus={step.id === focusStepId}
                    disabled={disabled}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? `${inputId}-error` : undefined}
                  />
                  {error && <p id={`${inputId}-error`} className="mt-1 text-xs text-red-700">{error}</p>}
                </div>
                <div className="flex shrink-0 items-center pt-1">
                  <button type="button" className={iconButtonClass} onClick={() => onMove(step.id, -1)} disabled={disabled || index === 0} aria-label={`Mover passo ${index + 1} para cima`}>↑</button>
                  <button type="button" className={iconButtonClass} onClick={() => onMove(step.id, 1)} disabled={disabled || index === steps.length - 1} aria-label={`Mover passo ${index + 1} para baixo`}>↓</button>
                  <button type="button" className={`${iconButtonClass} hover:text-red-700`} onClick={() => onRemove(step.id)} disabled={disabled} aria-label={`Remover passo ${index + 1}`}>✕</button>
                </div>
              </li>
            )
          })}
        </ol>
      )}

      <button
        type="button"
        onClick={onAdd}
        disabled={disabled}
        className="mt-3 w-full rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm font-medium text-primary hover:bg-sky-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-50"
      >
        + Adicionar passo à checklist
      </button>
    </fieldset>
  )
}
