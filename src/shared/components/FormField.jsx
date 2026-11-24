/**
 * Label + campo + mensagem de erro/ajuda. O campo recebe `id`, `aria-invalid` e `aria-describedby`
 * através da função `children(fieldProps)`, para o leitor de ecrã anunciar o erro associado.
 */
export default function FormField({ id, label, required = false, optional = false, error, hint, children }) {
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined

  return (
    <div>
      <label htmlFor={id} className="flex items-baseline justify-between text-sm font-medium text-slate-700">
        <span>
          {label}
          {required && (
            <span className="text-red-600" aria-hidden="true">
              {' '}
              *
            </span>
          )}
        </span>
        {optional && <span className="text-xs font-normal text-slate-400">Opcional</span>}
      </label>
      {children({ id, 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy })}
      {hint && !error && (
        <p id={hintId} className="mt-1 text-xs text-slate-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
