import { useCallback, useState } from 'react'
import ErrorAlert from '../../../shared/components/ErrorAlert'
import LoadingSpinner from '../../../shared/components/LoadingSpinner'
import Notice from '../../../shared/components/Notice'
import { SECONDARY_BUTTON } from '../../../shared/components/uiClasses'
import NewAppointmentDialog from '../../agenda/components/NewAppointmentDialog'
import { formatDateTime } from '../../agenda/utils/date'
import { useAuth } from '../../auth/hooks/useAuth'
import AlertThresholdsModal from '../components/AlertThresholdsModal'
import DailySchedulePanel from '../components/DailySchedulePanel'
import DashboardHeader from '../components/DashboardHeader'
import DashboardStats from '../components/DashboardStats'
import FleetStabilityCard from '../components/FleetStabilityCard'
import PoolAlertsList from '../components/PoolAlertsList'
import { useDashboard } from '../hooks/useDashboard'

/**
 * Centro de Controlo & Despacho Operacional (`/dashboard`, RF-WEB05, D-11, D-12).
 * O estado de UI vive nesta página; os componentes são apresentacionais e não importam serviços/Firebase.
 */
export default function DashboardPage() {
  const { user } = useAuth()
  const dashboard = useDashboard({ adminUid: user?.uid ?? null })
  const [alertFilter, setAlertFilter] = useState('all')
  const [thresholdsModalOpen, setThresholdsModalOpen] = useState(false)
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const clearNotice = useCallback(() => setNotice(''), [])

  function openThresholdsModal() {
    dashboard.clearActionError()
    setThresholdsModalOpen(true)
  }

  async function handleSaveThresholds(payload) {
    const ok = await dashboard.saveThresholds(payload)
    if (ok) {
      setThresholdsModalOpen(false)
      setNotice('Limiares de alerta atualizados em settings/alert_thresholds.')
    }
    return ok
  }

  // O agendamento criado aqui aparece sozinho na "Escala diária" se for para hoje (subscrição do dia).
  function handleAppointmentCreated(payload) {
    setAppointmentDialogOpen(false)
    setNotice(`Agendamento criado para ${formatDateTime(payload.date)}. Consulte-o na agenda.`)
  }

  const monitoredPoolsCount = dashboard.fleetStability.total
  const activePoolsCount = dashboard.counts?.activePools

  return (
    <div className="space-y-6">
      <DashboardHeader
        thresholds={dashboard.thresholds}
        hasSavedThresholds={dashboard.hasSavedThresholds}
        activePoolsCount={activePoolsCount}
        monitoredPoolsCount={monitoredPoolsCount}
        lastSyncedAt={dashboard.lastSyncedAt}
        onOpenThresholds={openThresholdsModal}
        onCreateAppointment={() => setAppointmentDialogOpen(true)}
      />

      <Notice message={notice} onClose={clearNotice} />

      {dashboard.loading ? (
        <LoadingSpinner label="A carregar centro de controlo..." />
      ) : dashboard.error ? (
        <div className="space-y-3">
          <ErrorAlert message={dashboard.error} />
          <button type="button" onClick={dashboard.reload} className={SECONDARY_BUTTON}>
            Tentar novamente
          </button>
        </div>
      ) : (
        <>
          {dashboard.streamErrors.map((streamError) => (
            <ErrorAlert key={streamError} message={streamError} />
          ))}

          <DashboardStats
            dailySchedule={dashboard.dailySchedule}
            openTickets={dashboard.tickets}
            openTicketsTotal={dashboard.counts?.openTickets}
            poolAlerts={dashboard.poolAlerts}
            lowStockCount={dashboard.lowStockConsumables.length}
            activeClientsCount={dashboard.counts?.activeClients}
          />

          <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-8">
              <PoolAlertsList
                poolAlerts={dashboard.poolAlerts}
                lowStockConsumables={dashboard.lowStockConsumables}
                openTickets={dashboard.tickets}
                clientsById={dashboard.clientsById}
                poolsById={dashboard.poolsById}
                filter={alertFilter}
                onFilterChange={setAlertFilter}
              />
            </div>

            <aside className="space-y-6 lg:col-span-4" aria-label="Escala diária e conformidade">
              <DailySchedulePanel dailySchedule={dashboard.dailySchedule} poolsById={dashboard.poolsById} />
              <FleetStabilityCard fleetStability={dashboard.fleetStability} activePoolsCount={activePoolsCount} />
            </aside>
          </div>
        </>
      )}

      {thresholdsModalOpen && (
        <AlertThresholdsModal
          key={JSON.stringify(dashboard.thresholds)}
          thresholds={dashboard.thresholds}
          serverError={dashboard.actionError}
          onDismissError={dashboard.clearActionError}
          onSubmit={handleSaveThresholds}
          onClose={() => setThresholdsModalOpen(false)}
        />
      )}

      {appointmentDialogOpen && (
        <NewAppointmentDialog
          onCreated={handleAppointmentCreated}
          onClose={() => setAppointmentDialogOpen(false)}
        />
      )}
    </div>
  )
}
