export default function ErrorAlert({ message, onClose }) {
  if (!message) return null

  return (
    <div
      role="alert"
      className="flex items-start justify-between gap-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
    >
      <span>{message}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar aviso"
          className="font-bold leading-none hover:text-red-900"
        >
          ×
        </button>
      )}
    </div>
  )
}
