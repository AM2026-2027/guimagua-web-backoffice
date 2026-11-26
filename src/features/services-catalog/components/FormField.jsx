/**
 * Label + campo + mensagem de erro. O campo recebe `id`, `aria-invalid` e `aria-describedby`
 * através de `children(fieldProps)`, para o leitor de ecrã anunciar o erro associado.
 */
export default function FormField({ id, label, required = false, error, hint, children }) {
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-600" aria-hidden="true"> *</span>}
      </label>
      {children({ id, 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy })}
      {hint && !error && <p id={hintId} className="mt-1 text-xs text-slate-600">{hint}</p>}
      {error && <p id={errorId} className="mt-1 text-xs text-red-700">{error}</p>}
    </div>
  )
}

export const inputClass = 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 aria-[invalid=true]:border-red-500'
