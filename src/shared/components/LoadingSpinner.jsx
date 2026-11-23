export default function LoadingSpinner({ label = 'A carregar...', fullScreen = false }) {
  return (
    <div
      role="status"
      className={`flex items-center justify-center ${fullScreen ? 'min-h-screen bg-background' : 'py-8'}`}
    >
      <div className="flex flex-col items-center gap-3 text-primary">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        {label && <span className="text-sm font-medium">{label}</span>}
      </div>
    </div>
  )
}
