import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getAuthErrorMessage } from '../utils/authErrors'
import ErrorAlert from '../../../shared/components/ErrorAlert'

const INPUT_CLASS =
  'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30'

export default function AuthForm() {
  const { login, resetPassword, authError } = useAuth()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
    setSubmitting(true)
    try {
      if (isLogin) {
        await login(email.trim(), password)
      } else {
        try {
          await resetPassword(email.trim())
        } catch (err) {
          // Não revelar se o email existe
          if (err?.code !== 'auth/user-not-found') throw err
        }
        setSuccess(
          'Se existir uma conta associada a este email, enviámos as instruções de recuperação.',
        )
      }
    } catch (err) {
      setError(getAuthErrorMessage(err?.code))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">
          {isLogin ? 'Iniciar Sessão' : 'Recuperar Password'}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {isLogin
            ? 'Aceda com as suas credenciais.'
            : 'Indique o seu email para receber o link de recuperação.'}
        </p>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={INPUT_CLASS}
        />
      </div>

      {isLogin && (
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            Palavra-passe
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${INPUT_CLASS} pr-20`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((show) => !show)}
              className="absolute inset-y-0 right-0 mt-1 px-3 text-sm text-primary hover:underline"
            >
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
        </div>
      )}

      <ErrorAlert message={error || authError} onClose={error ? () => setError('') : undefined} />
      {success && (
        <p role="status" className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          {success}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-primary px-4 py-2 font-medium text-white hover:bg-primary-dark disabled:opacity-60"
      >
        {submitting
          ? 'A processar...'
          : isLogin
            ? 'Entrar'
            : 'Enviar link de recuperação'}
      </button>

      <div className="text-center">
        <button type="button" onClick={switchMode} className="text-sm text-primary hover:underline">
          {isLogin ? 'Esqueceu-se da palavra-passe?' : 'Voltar ao início de sessão'}
        </button>
      </div>
    </form>
  )
}
