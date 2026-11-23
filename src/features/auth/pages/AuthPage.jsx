import { Navigate, useLocation } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import AuthForm from '../components/AuthForm'
import LoadingSpinner from '../../../shared/components/LoadingSpinner'

export default function AuthPage() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingSpinner fullScreen />

  if (user) {
    const from = location.state?.from?.pathname || '/dashboard'
    return <Navigate to={from} replace />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-primary">Guimágua Smart Pool</h1>
          <p className="text-xs uppercase tracking-wider text-slate-500">Backoffice</p>
        </div>
        <AuthForm />
      </div>
    </div>
  )
}
