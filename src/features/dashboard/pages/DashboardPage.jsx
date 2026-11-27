import { useCallback, useState } from 'react'
import ErrorAlert from '../../../shared/components/ErrorAlert'
import LoadingSpinner from '../../../shared/components/LoadingSpinner'
import Notice from '../../../shared/components/Notice'
import { PRIMARY_BUTTON, SECONDARY_BUTTON } from '../../../shared/components/uiClasses'
import NewAppointmentDialog from '../../agenda/components/NewAppointmentDialog'
import { formatDateTime } from '../../agenda/utils/date'
import { useAuth } from '../../auth/hooks/useAuth'
import KpiCards from '../components/KpiCards'
import LowStockCard from '../components/LowStockCard'
import PoolAlertsCard from '../components/PoolAlertsCard'
import RecentTicketsCard from '../components/RecentTicketsCard'
import ThresholdsModal from '../components/ThresholdsModal'
import TodayScheduleCard from '../components/TodayScheduleCard'
import { useDashboard } from '../hooks/useDashboard'
import { formatLisbonDateTime, formatLisbonTodayLabel, toDate } from '../utils/labels'
import { evaluateReadingAlerts, isCriticalConsumable } from '../utils/thresholds'

export default function DashboardPage() {
  const { profile, user } = useAuth()
  const {
    data,
    loading,
    refreshing,
    error,
    actionError,
    savingThresholds,
    refresh,
    saveThresholds,
    clearActionError,
  } = useDashboard()

  const [alertFilter, setAlertFilter] = useState('alerts')
  const [thresholdsModalOpen, setThresholdsModalOpen] = useState(false)
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const clearNotice = useCallback(() => setNotice(''), [])

  // Estados derivados calculados na renderização sobre novos arrays (sem mutar o estado).
  const poolStatuses = data
    ? data.latestReadings
        .map((reading) => {
          const pool = data.poolsById[reading.pool_id] ?? null
          const client = pool?.client_id ? (data.clientsById[pool.client_id] ?? null) : null
          const deviations = evaluateReadingAlerts(reading, data.thresholds)
          return { reading, pool, client, deviations }
        })
        .sort((a, b) => {
          const aCritical = a.deviations.some((item) => item.severity === 'critical') ? 2 : a.deviations.length > 0 ? 1 : 0
          const bCritical = b.deviations.some((item) => item.severity === 'critical') ? 2 : b.deviations.length > 0 ? 1 : 0
          if (aCritical !== bCritical) return bCritical - aCritical
          const aTime = toDate(a.reading.timestamp)?.getTime() ?? 0
          const bTime = toDate(b.reading.timestamp)?.getTime() ?? 0
          return bTime - aTime
        })
    : []

  const criticalConsumables = data
    ? data.activeConsumables.filter(isCriticalConsumable).sort((a, b) => {
        const aPhysicalLow = Number(a.stock_quantity) <= Number(a.min_stock) ? 1 : 0
        const bPhysicalLow = Number(b.stock_quantity) <= Number(b.min_stock) ? 1 : 0
        if (aPhysicalLow !== bPhysicalLow) return bPhysicalLow - aPhysicalLow
        return String(a.name ?? '').localeCompare(String(b.name ?? ''), 'pt-PT')
      })
    : []

  function openThresholdsModal() {
    clearActionError()
    setThresholdsModalOpen(true)
  }

  function closeThresholdsModal() {
    clearActionError()
    setThresholdsModalOpen(false)
  }

  async function handleSaveThresholds(payload) {
    const ok = await saveThresholds(payload, user?.uid ?? null)
    if (ok) {
      setThresholdsModalOpen(false)
      setNotice('Limiares de alerta atualizados com sucesso.')
    }
  }

  async function handleRefresh() {
    const ok = await refresh()
    if (ok) {
      setNotice('Dados do painel atualizados.')
    }
  }

  function handleAppointmentCreated(payload) {
    setAppointmentDialogOpen(false)
    setNotice(`Agendamento criado para ${formatDateTime(payload.date)}. Consulte-o na agenda.`)
  }

  return (
    <div className="mx-auto max-w-[1500px] space-y-5 pb-8">
      <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Visão geral operacional · {formatLisbonTodayLabel()}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Dashboard{profile?.name ? ` — Olá, ${profile.name}` : ''}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Métricas operacionais, escala diária e alertas de qualidade da água (
            {data?.fetchedAt ? `atualizado em ${formatLisbonDateTime(data.fetchedAt)}` : 'a sincronizar…'}).
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={openThresholdsModal}
            disabled={loading || !data}
            className={SECONDARY_BUTTON}
          >
            Configurar limiares
          </button>
          <button
            type="button"
            onClick={() => setAppointmentDialogOpen(true)}
            className={SECONDARY_BUTTON}
          >
            Agendar intervenção
          </button>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className={PRIMARY_BUTTON}
          >
            {refreshing ? 'A atualizar…' : 'Atualizar'}
          </button>
        </div>
      </header>

      <Notice message={notice} onClose={clearNotice} />
      {!thresholdsModalOpen && <ErrorAlert message={actionError} onClose={clearActionError} />}

      {loading ? (
        <LoadingSpinner label="A carregar indicadores e alertas do painel…" />
      ) : error ? (
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6">
          <ErrorAlert message={error} />
          <div>
            <button type="button" onClick={handleRefresh} disabled={refreshing} className={PRIMARY_BUTTON}>
              {refreshing ? 'A tentar…' : 'Tentar novamente'}
            </button>
          </div>
        </div>
      ) : (
        data && (
          <>
            <KpiCards
              openTicketsCount={data.openTicketsCount}
              todayAppointments={data.todayAppointments}
              activeClientsCount={data.activeClientsCount}
              criticalConsumables={criticalConsumables}
              totalActiveConsumables={data.activeConsumables.length}
            />

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,1fr)]">
              <div className="space-y-5">
                <PoolAlertsCard
                  poolStatuses={poolStatuses}
                  thresholds={data.thresholds}
                  filter={alertFilter}
                  onFilterChange={setAlertFilter}
                  onOpenThresholds={openThresholdsModal}
                />
                <RecentTicketsCard
                  tickets={data.recentTickets}
                  clientsById={data.clientsById}
                  poolsById={data.poolsById}
                />
              </div>

              <div className="space-y-5">
                <TodayScheduleCard
                  appointments={data.todayAppointments}
                  poolsById={data.poolsById}
                  clientsById={data.clientsById}
                  staffById={data.staffById}
                />
                <LowStockCard criticalConsumables={criticalConsumables} />
              </div>
            </div>
          </>
        )
      )}

      {thresholdsModalOpen && data && (
        <ThresholdsModal
          key={data.thresholds?.updated_at ? String(toDate(data.thresholds.updated_at)?.getTime() ?? 'saved') : 'default'}
          thresholds={data.thresholds}
          saving={savingThresholds}
          serverError={actionError}
          onClose={closeThresholdsModal}
          onSave={handleSaveThresholds}
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
