import { useEffect, useId } from 'react'

/**
 * Janela modal acessível (role="dialog", título associado, fecha com Escape ou clique fora).
 * Enquanto se grava, a página passa `onClose` desativado para não perder o pedido a meio.
 */
export default function Modal({ title, description, onClose, children, size = 'md' }) {
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    // Limpeza: retira o listener quando a modal fecha.
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const width = size === 'sm' ? 'max-w-md' : size === 'lg' ? 'max-w-3xl' : 'max-w-2xl'

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={`my-8 w-full ${width} rounded-2xl border border-slate-200 bg-white shadow-xl`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-slate-800">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-1 text-sm text-slate-500">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-lg px-2 py-1 text-xl leading-none text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            ×
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}
