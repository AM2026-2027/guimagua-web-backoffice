import { useState } from 'react'
import { ROLE_LABELS } from '../constants/roles'
import { useAuth } from '../features/auth/hooks/useAuth'

function HeaderIcon({ children }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">{children}</svg>
}

export default function Header({ menuOpen, onToggleMenu }) {
  const { profile, user, logout } = useAuth()
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState('')
  const roleLabel = ROLE_LABELS[profile?.role] ?? 'Backoffice'

  async function confirmLogout() {
    setLoggingOut(true)
    setLogoutError('')
    try {
      await logout()
    } catch {
      setLogoutError('Não foi possível terminar a sessão. Tente novamente.')
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <>
      <header className="flex min-h-14 items-center gap-3 border-b border-slate-100 bg-white px-4 py-2.5 md:px-5">
        <button type="button" onClick={onToggleMenu} aria-label="Alternar menu" aria-expanded={menuOpen} className="rounded-md p-2 text-slate-600 hover:bg-slate-100 md:hidden">{menuOpen ? '✕' : '☰'}</button>
        <div className="flex items-center gap-2 text-[10px] text-slate-500 sm:text-[11px]">
          <span className="text-sky-700" aria-hidden="true"><HeaderIcon><path d="M20 7v5h-5M4 17v-5h5" /><path d="M5.7 9a7 7 0 0 1 11.6-2L20 9M4 15l2.7 2a7 7 0 0 0 11.6-2" /></HeaderIcon></span>
          <span>Última sincronização:</span><span className="font-semibold text-slate-700">Indisponível</span>
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="min-w-0 max-w-36 text-right sm:max-w-48">
            <p className="truncate text-[10px] font-semibold text-slate-800">{profile?.name || user?.email || 'Utilizador'}</p>
            <p className="truncate text-[9px] text-slate-500">{roleLabel}</p>
          </div>
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-50 text-xs font-bold text-primary" aria-hidden="true">{(profile?.name || user?.email || 'U').slice(0, 1).toLocaleUpperCase('pt-PT')}</span>
          <button type="button" onClick={() => { setLogoutError(''); setLogoutOpen(true) }} className="rounded-md border border-slate-200 px-3 py-1.5 text-[10px] font-semibold text-primary transition-colors hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-primary/20">Sair</button>
        </div>
      </header>
      {logoutOpen && <div role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !loggingOut) setLogoutOpen(false) }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
        <section role="dialog" aria-modal="true" aria-labelledby="logout-title" aria-describedby="logout-description" className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
          <h2 id="logout-title" className="text-lg font-semibold text-slate-900">Terminar sessão</h2>
          <p id="logout-description" className="mt-2 text-sm text-slate-600">Tem a certeza de que pretende sair da sua conta?</p>
          {logoutError && <p role="alert" className="mt-3 text-sm text-red-700">{logoutError}</p>}
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" disabled={loggingOut} onClick={() => setLogoutOpen(false)} className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">Cancelar</button>
            <button type="button" disabled={loggingOut} onClick={confirmLogout} className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:cursor-wait disabled:opacity-60">{loggingOut ? 'A sair…' : 'Sair'}</button>
          </div>
        </section>
      </div>}
    </>
  )
}
