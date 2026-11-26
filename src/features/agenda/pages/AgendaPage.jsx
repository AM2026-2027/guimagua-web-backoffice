import { useCallback, useEffect, useMemo, useState } from 'react'
import ConfirmDialog from '../../../shared/components/ConfirmDialog'
import ErrorAlert from '../../../shared/components/ErrorAlert'
import LoadingSpinner from '../../../shared/components/LoadingSpinner'
import Notice from '../../../shared/components/Notice'
import { SECONDARY_BUTTON } from '../../../shared/components/uiClasses'
import AgendaHeader from '../components/AgendaHeader'
import AgendaStats from '../components/AgendaStats'
import AgendaToolbar from '../components/AgendaToolbar'
import ActiveAppointmentPanel from '../components/ActiveAppointmentPanel'
import AppointmentDetailModal from '../components/AppointmentDetailModal'
import AppointmentFormModal from '../components/AppointmentFormModal'
import DailyTimeline from '../components/DailyTimeline'
import { useAppointmentActions } from '../hooks/useAppointmentActions'
import { useAppointmentDetail } from '../hooks/useAppointmentDetail'
import { useAppointments } from '../hooks/useAppointments'
import { dateKeyInLisbon, dateKeyOf, formatDateTime, shiftDateKey } from '../utils/date'
import { APPOINTMENT_STATUS_OPTIONS } from '../utils/labels'
import { occupiesStaff } from '../utils/schedule'
import { sortAppointments } from '../utils/sort'
import { appointmentMatchesSearch } from '../utils/text'

export default function AgendaPage() {
  const [todayKey, setTodayKey] = useState(() => dateKeyInLisbon())
  const [dateKey, setDateKey] = useState(() => dateKeyInLisbon())
  const [status, setStatus] = useState('active')
  const [searchTerm, setSearchTerm] = useState('')
  const [now, setNow] = useState(() => new Date())
  const [dialog, setDialog] = useState(null)
  const [notice, setNotice] = useState('')
  const agenda = useAppointments(dateKey)

  useEffect(() => {
    const timer = setInterval(() => {
      const current = new Date()
      setNow(current)
      setTodayKey(dateKeyInLisbon(current))
    }, 60_000)
    // Limpeza: cancela o relógio local ao sair da página; não cria leituras Firestore.
    return () => clearInterval(timer)
  }, [])

  const staffById = useMemo(
    () => Object.fromEntries(agenda.staff.map((person) => [person.id, person])),
    [agenda.staff],
  )
  const servicesById = useMemo(
    () => Object.fromEntries(agenda.services.map((service) => [service.id, service])),
    [agenda.services],
  )
  const actions = useAppointmentActions(servicesById)
  const enrichedAppointments = useMemo(
    () =>
      agenda.appointments.map((appointment) => {
        const pool = agenda.poolsById[appointment.pool_id]
        const client = agenda.clientsById[pool?.client_id]
        return {
          ...appointment,
          staff: staffById[appointment.tech_id],
          service: servicesById[appointment.service_id],
          pool,
          client,
        }
      }),
    [agenda.appointments, agenda.clientsById, agenda.poolsById, servicesById, staffById],
  )
  const activeAppointment = useMemo(
    () => sortAppointments(enrichedAppointments).find((appointment) => appointment.status === 'in_progress') ?? null,
    [enrichedAppointments],
  )
  const detail = useAppointmentDetail(activeAppointment?.pool_id ?? null)
  const visibleAppointments = useMemo(
    () =>
      sortAppointments(enrichedAppointments).filter(
        (appointment) =>
          (status === 'active' ? occupiesStaff(appointment) : appointment.status === status) &&
          appointmentMatchesSearch(appointment, searchTerm),
      ),
    [enrichedAppointments, searchTerm, status],
  )

  const selectedAppointment = dialog?.id
    ? enrichedAppointments.find((appointment) => appointment.id === dialog.id) ?? null
    : null
  const clearNotice = useCallback(() => setNotice(''), [])

  function openDialog(type, id = null) {
    actions.clearError()
    setDialog({ type, id })
  }

  function closeDialog() {
    actions.clearError()
    setDialog(null)
  }

  async function handleCreate(payload) {
    const saved = await actions.create(payload)
    if (saved) {
      setDialog(null)
      // Mostra o dia do novo agendamento: a subscrição desse dia apresenta-o de imediato (US06).
      setDateKey(dateKeyOf(payload.date))
      setNotice(`Agendamento criado para ${formatDateTime(payload.date)}.`)
    }
    return saved
  }

  async function handleReschedule(payload) {
    const saved = await actions.reschedule(dialog.id, payload)
    if (saved) {
      setDialog(null)
      setDateKey(dateKeyOf(payload.date))
      setNotice(`Intervenção reagendada para ${formatDateTime(payload.date)}.`)
    }
    return saved
  }

  async function handleCancel() {
    const cancelled = await actions.cancel(selectedAppointment)
    if (cancelled) {
      setDialog(null)
      setNotice('Agendamento cancelado. O stock projetado dos consumíveis foi reposto.')
    }
    return cancelled
  }

  function changeDate(offset) {
    setDateKey(offset === 0 ? todayKey : shiftDateKey(dateKey, offset))
  }

  function printSchedule() {
    window.print()
  }

  return (
    <div className="space-y-5">
      <AgendaHeader
        onPrint={printSchedule}
        onCreate={() => openDialog('create')}
        createDisabled={agenda.loading}
      />
      <Notice message={notice} onClose={clearNotice} />
      <AgendaToolbar
        dateKey={dateKey}
        todayKey={todayKey}
        status={status}
        statusOptions={APPOINTMENT_STATUS_OPTIONS}
        searchTerm={searchTerm}
        onDateChange={changeDate}
        onStatusChange={setStatus}
        onSearchChange={setSearchTerm}
      />

      {agenda.error && <ErrorAlert message={agenda.error} />}
      {agenda.loading ? (
        <LoadingSpinner label="A carregar a agenda do dia..." />
      ) : agenda.error ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-600">A agenda não está disponível. Tente atualizar a consulta.</p>
          <button type="button" onClick={agenda.reload} className={`${SECONDARY_BUTTON} mt-3`}>
            Atualizar Agora
          </button>
        </div>
      ) : (
        <>
          <AgendaStats
            appointments={agenda.appointments}
            staffById={staffById}
            servicesById={servicesById}
          />
          <div className="print:hidden">
            <button
              type="button"
              onClick={agenda.reload}
              className={SECONDARY_BUTTON}
            >
              Atualizar Agora
            </button>
          </div>
          <DailyTimeline
            dateKey={dateKey}
            appointments={visibleAppointments}
            staff={agenda.staff}
            staffById={staffById}
            poolsById={agenda.poolsById}
            clientsById={agenda.clientsById}
            servicesById={servicesById}
            now={now}
            hasAnyAppointments={agenda.appointments.length > 0}
            onSelect={(id) => openDialog('detail', id)}
          />
          <ActiveAppointmentPanel
            appointment={activeAppointment}
            detail={detail}
            client={activeAppointment?.client}
            pool={activeAppointment?.pool}
            staff={activeAppointment?.staff}
            service={activeAppointment?.service}
          />
        </>
      )}

      {dialog?.type === 'create' && (
        <AppointmentFormModal
          initialDateKey={dateKey < todayKey ? todayKey : dateKey}
          todayKey={todayKey}
          staff={agenda.staff}
          services={agenda.services}
          servicesById={servicesById}
          onSubmit={handleCreate}
          error={actions.error}
          onDismissError={actions.clearError}
          onClose={closeDialog}
        />
      )}
      {dialog?.type === 'detail' && selectedAppointment && (
        <AppointmentDetailModal
          appointment={selectedAppointment}
          servicesById={servicesById}
          onReschedule={() => openDialog('reschedule', selectedAppointment.id)}
          onCancel={() => openDialog('cancel', selectedAppointment.id)}
          onClose={closeDialog}
        />
      )}
      {dialog?.type === 'reschedule' && selectedAppointment && (
        <AppointmentFormModal
          key={selectedAppointment.id}
          appointment={selectedAppointment}
          todayKey={todayKey}
          staff={agenda.staff}
          services={agenda.services}
          servicesById={servicesById}
          onSubmit={handleReschedule}
          error={actions.error}
          onDismissError={actions.clearError}
          onClose={closeDialog}
        />
      )}
      {dialog?.type === 'cancel' && selectedAppointment && (
        <ConfirmDialog
          title="Cancelar agendamento"
          message={`Cancelar a intervenção de ${formatDateTime(selectedAppointment.date)} (${selectedAppointment.client?.name ?? 'cliente não identificado'})? Os consumíveis reservados voltam ao stock projetado.`}
          confirmLabel="Cancelar agendamento"
          danger
          error={actions.error}
          onDismissError={actions.clearError}
          onConfirm={handleCancel}
          onCancel={closeDialog}
        />
      )}
    </div>
  )
}
