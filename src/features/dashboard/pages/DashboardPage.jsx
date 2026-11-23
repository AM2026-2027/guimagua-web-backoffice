import { useAuth } from '../../auth/hooks/useAuth'

export default function DashboardPage() {
  const { profile } = useAuth()
  return (
    <div>
      <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
      <p className="mt-2 text-slate-600">
        Bem-vindo(a){profile?.name ? `, ${profile.name}` : ''}.
      </p>
    </div>
  )
}
