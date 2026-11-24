import { Navigate, useLocation } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import AuthForm from '../components/AuthForm'
import LoadingSpinner from '../../../shared/components/LoadingSpinner'

function GuimaguaBrand() {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#004568] text-white shadow-sm">
        <svg viewBox="0 0 32 32" fill="none" className="h-7 w-7" aria-hidden="true"><path d="M5 10c3.5-3 6.5 3 10 0s6.5-3 12 0M5 16c3.5-3 6.5 3 10 0s6.5-3 12 0M5 22c3.5-3 6.5 3 10 0s6.5-3 12 0" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
      </span>
      <div className="leading-tight">
        <span className="block text-[17px] font-bold tracking-tight text-[#073c5b]">GUIMÁGUA</span>
        <p className="mt-1 text-[9px] font-medium tracking-[.12em] text-slate-500">SMART POOL OPS</p>
      </div>
    </div>
  )
}

export default function AuthPage() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingSpinner fullScreen />

  if (user) {
    const from = location.state?.from?.pathname || '/dashboard'
    return <Navigate to={from} replace />
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_#e8f2ff_0,_#f7f8ff_54%)] px-5 py-7 sm:px-8 lg:px-12">
      <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-[1220px] flex-col">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <GuimaguaBrand />
        </header>

        <main className="flex flex-1 items-center justify-center py-10 sm:py-12">
          <AuthForm />
        </main>

        <footer className="flex flex-col items-center justify-between gap-3 pb-2 text-center text-[10px] text-slate-500 sm:flex-row sm:text-left">
          <p>© {new Date().getFullYear()} Guimágua. Todos os direitos reservados.</p>
          <p className="flex items-center gap-2"><span>Apoio Técnico Operacional</span><span aria-hidden="true">•</span><span>Acesso reservado a utilizadores autorizados</span></p>
        </footer>
      </div>
    </div>
  )
}
