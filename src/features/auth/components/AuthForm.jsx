import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getAuthErrorMessage } from '../utils/authErrors'
import ErrorAlert from '../../../shared/components/ErrorAlert'

const INPUT_CLASS = 'h-12 w-full rounded-lg border border-transparent bg-[#eef3ff] py-3 pl-11 pr-11 text-sm text-slate-800 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100'

function FieldIcon({ children }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">{children}</svg>
}

function CardFooter() {
  return (
    <div className="flex items-center justify-between gap-3 bg-[#eef3ff] px-6 py-4 text-[10px] text-slate-500 sm:px-12">
      <span className="flex items-center gap-2"><FieldIcon><path d="M6 10V7a6 6 0 0 1 12 0v3M5 10h14v10H5zM12 14v2" /></FieldIcon>Autenticação gerida pelo Firebase</span>
      <span className="rounded-sm bg-blue-100 px-2 py-1 font-semibold text-slate-600">FIREBASE</span>
    </div>
  )
}

export default function AuthForm() {
  const { login, resetPassword, authError } = useAuth()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberSession, setRememberSession] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isLogin = mode === 'login'

  function switchMode() {
    setMode(isLogin ? 'reset' : 'login')
    setError('')
    setSuccess('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')
    if (!email.trim()) {
      setError('Indique o endereço de e-mail.')
      return
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('O endereço de e-mail não é válido.')
      return
    }
    if (isLogin && !password) {
      setError('Indique a palavra-passe.')
      return
    }
    setSubmitting(true)
    try {
      if (isLogin) {
        await login(email.trim(), password, rememberSession)
      } else {
        try {
          await resetPassword(email.trim())
        } catch (err) {
          // Não revelar se o email existe.
          if (err?.code !== 'auth/user-not-found') throw err
        }
        setSuccess('Se existir uma conta associada a este email, enviámos as instruções de recuperação.')
      }
    } catch (err) {
      setError(getAuthErrorMessage(err?.code))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="relative w-full max-w-[536px] overflow-hidden rounded-[18px] bg-white shadow-[0_18px_36px_rgba(15,35,65,0.14)]">
      <div className="h-1.5 bg-gradient-to-r from-[#004568] via-[#0876a5] to-sky-400" aria-hidden="true" />
      <div className="px-7 pb-7 pt-8 sm:px-12 sm:pb-8 sm:pt-9">
        {/* Logotipo Guimágua centrado no topo do cartão */}
        <div className="mb-6 flex flex-col items-center gap-2">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#004568] text-white shadow-sm">
            <svg viewBox="0 0 32 32" fill="none" className="h-7 w-7" aria-hidden="true"><path d="M5 10c3.5-3 6.5 3 10 0s6.5-3 12 0M5 16c3.5-3 6.5 3 10 0s6.5-3 12 0M5 22c3.5-3 6.5 3 10 0s6.5-3 12 0" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
          </span>
          <div className="text-center leading-tight">
            <span className="block text-[17px] font-bold tracking-tight text-[#073c5b]">GUIMÁGUA</span>
          </div>
        </div>

        <h1 className="text-lg font-bold tracking-tight text-slate-900">{isLogin ? 'Entrar na sua conta' : 'Recuperar palavra-passe'}</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{isLogin ? 'Acesso reservado a gestores operacionais, despachantes técnicos e supervisores Guimágua.' : 'Indique o email da sua conta para receber as instruções de recuperação.'}</p>

        <form noValidate onSubmit={handleSubmit} className="mt-7 space-y-5">
          <div>
            <div className="mb-1.5 flex items-baseline justify-between gap-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-800">Endereço de E-mail</label>
              <span className="text-xs text-slate-500">Ex: gestor@guimagua.pt</span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-slate-500" aria-hidden="true"><FieldIcon><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></FieldIcon></span>
              <input id="email" name="email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nome@guimagua.pt" className={INPUT_CLASS} />
            </div>
          </div>

          {isLogin && <div>
            <div className="mb-1.5 flex items-baseline justify-between gap-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-800">Palavra-passe</label>
              <span className="text-xs text-slate-500">Credenciais da sua conta</span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-slate-500" aria-hidden="true"><FieldIcon><circle cx="8" cy="15" r="4" /><path d="m11 12 8-8 2 2-2 2 2 2-3 3-2-2-2 2M8 15h.01" /></FieldIcon></span>
              <input id="password" name="password" type={showPassword ? 'text' : 'password'} required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className={INPUT_CLASS} />
              <button type="button" aria-label={showPassword ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'} onClick={() => setShowPassword((show) => !show)} className="absolute right-3.5 top-3.5 text-slate-500 hover:text-primary"><FieldIcon>{showPassword ? <><path d="M3 3l18 18" /><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.9 5.2A11 11 0 0 1 12 5c5 0 8.5 4.5 9.5 7-.4 1-1.2 2.1-2.2 3.1M6.2 6.2C4.3 7.5 3 9.3 2.5 12c.7 2.1 2.1 3.7 4.1 5a10 10 0 0 0 5.4 2c1.1 0 2.1-.2 3-.5" /></> : <><path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" /><circle cx="12" cy="12" r="3" /></>}</FieldIcon></button>
            </div>
          </div>}

          <ErrorAlert message={error || authError} onClose={error ? () => setError('') : undefined} />
          {success && <p role="status" className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{success}</p>}

          {isLogin && <div className="flex items-start justify-between gap-4 text-sm">
            <label className="flex max-w-56 cursor-pointer items-start gap-2 text-slate-600">
              <input type="checkbox" checked={rememberSession} onChange={(event) => setRememberSession(event.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-[#004568]" />
              <span>Lembrar sessão neste posto</span>
            </label>
            <button type="button" onClick={switchMode} className="text-left font-medium text-sky-700 underline decoration-1 underline-offset-2 hover:text-primary">Esqueceu-se da palavra-passe?</button>
          </div>}

          <button type="submit" disabled={submitting} className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#003e5c] px-4 text-sm font-semibold text-white shadow-md transition hover:bg-[#002f47] disabled:cursor-wait disabled:opacity-60">
            {submitting ? 'A processar…' : isLogin ? <>Entrar na Plataforma <span aria-hidden="true">→</span></> : 'Enviar instruções'}
          </button>

          {!isLogin && <button type="button" onClick={switchMode} className="w-full text-sm font-medium text-primary hover:underline">Voltar ao início de sessão</button>}
        </form>
      </div>
      <CardFooter />
    </section>
  )
}
