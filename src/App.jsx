import { Routes, Route, Navigate } from 'react-router'
import AuthProvider from './features/auth/context/AuthProvider'
import { useAuth } from './features/auth/hooks/useAuth'
import RequireAuth from './features/auth/components/RequireAuth'
import RequireRole from './features/auth/components/RequireRole'
import AuthPage from './features/auth/pages/AuthPage'
import DashboardPage from './features/dashboard/pages/DashboardPage'
import TicketsPage from './features/tickets/pages/TicketsPage'
import AgendaPage from './features/agenda/pages/AgendaPage'
import ClientsPage from './features/clients/pages/ClientsPage'
import TeamPage from './features/team/pages/TeamPage'
import ServicesPage from './features/services-catalog/pages/ServicesPage'
import InventoryPage from './features/inventory/pages/InventoryPage'
import ReportsPage from './features/reports/pages/ReportsPage'
import MainLayout from './layout/MainLayout'
import MessagePage from './shared/components/MessagePage'
import { ROLES } from './constants/roles'

function ForbiddenPage() {
  const { logout } = useAuth()
  return (
    <MessagePage
      code="403"
      title="Acesso negado"
      message="Esta conta não tem permissões para aceder ao Backoffice. Apenas administradores têm acesso."
      action={
        <button
          type="button"
          onClick={logout}
          className="w-full rounded-lg bg-primary px-4 py-2 font-medium text-white hover:bg-primary-dark"
        >
          Terminar sessão e trocar de conta
        </button>
      }
    />
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />

        <Route element={<RequireAuth />}>
          <Route path="/sem-acesso" element={<ForbiddenPage />} />

          <Route element={<RequireRole allowedRoles={[ROLES.ADMIN]} />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/tickets" element={<TicketsPage />} />
              <Route path="/agenda" element={<AgendaPage />} />
              <Route path="/clients" element={<ClientsPage />} />
              <Route path="/team" element={<TeamPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/reports" element={<ReportsPage />} />
            </Route>
          </Route>
        </Route>

        <Route
          path="*"
          element={
            <MessagePage
              code="404"
              title="Página não encontrada"
              message="O endereço que procura não existe."
              linkTo="/"
              linkLabel="Voltar ao início"
            />
          }
        />
      </Routes>
    </AuthProvider>
  )
}
