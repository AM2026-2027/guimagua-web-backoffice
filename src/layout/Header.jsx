import { useAuth } from '../features/auth/hooks/useAuth'

export default function Header({ menuOpen, onToggleMenu }) {
  const { profile, user, logout } = useAuth()

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMenu}
          aria-label="Alternar menu"
          aria-expanded={menuOpen}
          className="rounded-lg border border-slate-300 px-2 py-1 text-slate-700 md:hidden"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
        <div className="text-sm leading-tight">
          <div className="font-medium text-slate-800">{profile?.name || '—'}</div>
          <div className="text-slate-500">{profile?.email || user?.email}</div>
        </div>
      </div>
      <button
        type="button"
        onClick={logout}
        className="rounded-lg border border-primary px-3 py-1.5 text-sm text-primary hover:bg-primary hover:text-white"
      >
        Sair
      </button>
    </header>
  )
}
