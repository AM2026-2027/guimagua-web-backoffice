import { useEffect, useMemo, useState } from 'react'
import ErrorAlert from '../../../shared/components/ErrorAlert'
import LoadingSpinner from '../../../shared/components/LoadingSpinner'
import { SECONDARY_BUTTON } from '../../../shared/components/uiClasses'
import AgendaHeader from '../components/AgendaHeader'
import AgendaStats from '../components/AgendaStats'
import AgendaToolbar from '../components/AgendaToolbar'
import ActiveAppointmentPanel from '../components/ActiveAppointmentPanel'
import DailyTimeline from '../components/DailyTimeline'
import FleetTelemetryPanel from '../components/FleetTelemetryPanel'
import { useAppointmentDetail } from '../hooks/useAppointmentDetail'
import { useAppointments } from '../hooks/useAppointments'
import { dateKeyInLisbon, shiftDateKey } from '../utils/date'
import { APPOINTMENT_STATUS_OPTIONS } from '../utils/labels'
import { sortAppointments } from '../utils/sort'
import { appointmentMatchesSearch } from '../utils/text'

export default function AgendaPage() {
  const [todayKey, setTodayKey] = useState(() => dateKeyInLisbon())
  const [dateKey, setDateKey] = useState(() => dateKeyInLisbon())
  const [status, setStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [now, setNow] = useState(() => new Date())
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
          (status === 'all' || appointment.status === status) &&
          appointmentMatchesSearch(appointment, searchTerm),
      ),
    [enrichedAppointments, searchTerm, status],
  )

  function changeDate(offset) {
    setDateKey(offset === 0 ? todayKey : shiftDateKey(dateKey, offset))
  }

  function printSchedule() {
    window.print()
  }

  return (
    <div className="space-y-5">
      <AgendaHeader onPrint={printSchedule} />
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
          />
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(18rem,1fr)]">
            <ActiveAppointmentPanel
              appointment={activeAppointment}
              detail={detail}
              client={activeAppointment?.client}
              pool={activeAppointment?.pool}
              staff={activeAppointment?.staff}
              service={activeAppointment?.service}
            />
            <FleetTelemetryPanel />
          </div>
        </>
      )}
    </div>
  )
}
