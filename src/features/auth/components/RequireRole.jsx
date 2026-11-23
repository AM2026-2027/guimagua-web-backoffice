import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../hooks/useAuth'

export default function RequireRole({ allowedRoles }) {
  const { role } = useAuth()

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/sem-acesso" replace />
  }

  return <Outlet />
}
