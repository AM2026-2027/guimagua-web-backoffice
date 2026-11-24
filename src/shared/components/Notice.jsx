import { useEffect } from 'react'

const AUTO_DISMISS_MS = 5000

/** Aviso de sucesso (RNF-GLB03): anunciado ao leitor de ecrã e fechado automaticamente após 5 s. */
export default function Notice({ message, onClose }) {
  useEffect(() => {
    if (!message) return undefined
    const timer = setTimeout(onClose, AUTO_DISMISS_MS)
    // Limpeza: cancela o temporizador se a mensagem mudar ou o componente sair do ecrã.
    return () => clearTimeout(timer)
  }, [message, onClose])

  if (!message) return null

  return (
    <div
      role="status"
      className="flex items-start justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar aviso"
        className="font-bold leading-none hover:text-emerald-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
      >
        ×
      </button>
    </div>
  )
}
