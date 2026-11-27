import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router'
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
import WeekAgendaList from '../components/WeekAgendaList'
import WeekGrid from '../components/WeekGrid'
import WeekToolbar from '../components/WeekToolbar'
import MonthAgendaList from '../components/MonthAgendaList'
import MonthGrid from '../components/MonthGrid'
import MonthLegend from '../components/MonthLegend'
import MonthToolbar from '../components/MonthToolbar'
import { useAppointmentActions } from '../hooks/useAppointmentActions'
import { useAppointmentDetail } from '../hooks/useAppointmentDetail'
import { useAppointments } from '../hooks/useAppointments'
import { useMonthAppointments } from '../hooks/useMonthAppointments'
import { useWeekAppointments } from '../hooks/useWeekAppointments'
import { dateKeyInLisbon, dateKeyOf, formatDateTime, shiftDateKey } from '../utils/date'
import {
  APPOINTMENT_STATUS_OPTIONS,
  specialtyLabel,
} from '../utils/labels'
import { getMonthGridDays, shiftMonthKey } from '../utils/month'
import { occupiesStaff } from '../utils/schedule'
import { sortAppointments } from '../utils/sort'
import { appointmentMatchesSearch } from '../utils/text'
import { getWeekStartDateKey } from '../utils/viewParams'
import { shiftWeekKey } from '../utils/week'
import {
  createDaySearchParams,
  createMonthSearchParams,
  createWeekSearchParams,
  parseAgendaViewParams,
} from '../utils/viewParams'

export default function AgendaPage() {
  const [todayKey, setTodayKey] = useState(() => dateKeyInLisbon())
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const actualSearch = searchParams.toString()
  const viewParams = parseAgendaViewParams(searchParams, todayKey)
  const { view, dateKey, monthKey, weekKey, normalizedSearch } = viewParams
  const paramsAreNormalized = actualSearch === normalizedSearch
  const [status, setStatus] = useState('active')
  const [searchTerm, setSearchTerm] = useState('')
  const [monthStatus, setMonthStatus] = useState('not_cancelled')
  const [specialtyFilter, setSpecialtyFilter] = useState('all')
  const [now, setNow] = useState(() => new Date())
  const [dialog, setDialog] = useState(null)
  const [notice, setNotice] = useState('')
  const dayAgenda = useAppointments(dateKey, {
    enabled: view === 'day' && paramsAreNormalized,
    loadReferences: view === 'day' && paramsAreNormalized,
  })
  const monthAgenda = useMonthAppointments(
    monthKey,
    view === 'month' && paramsAreNormalized,
    location.key,
  )
  const weekAgenda = useWeekAppointments(
    weekKey,
    view === 'week' && paramsAreNormalized,
    location.key,
  )

  useEffect(() => {
    const timer = setInterval(() => {
      const current = new Date()
      setNow(current)
      setTodayKey(dateKeyInLisbon(current))
    }, 60_000)
    // Limpeza: cancela o relógio local ao sair da página; não cria leituras Firestore.
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (actualSearch !== normalizedSearch) {
      setSearchParams(new URLSearchParams(normalizedSearch), { replace: true })
    }
  }, [actualSearch, normalizedSearch, setSearchParams])

  const staffById = useMemo(
    () => Object.fromEntries(dayAgenda.staff.map((person) => [person.id, person])),
    [dayAgenda.staff],
  )
  const servicesById = useMemo(
    () => Object.fromEntries(dayAgenda.services.map((service) => [service.id, service])),
    [dayAgenda.services],
  )
  const actions = useAppointmentActions(servicesById)

  const enrichedAppointments = useMemo(
    () =>
      dayAgenda.appointments.map((appointment) => {
        const pool = dayAgenda.poolsById[appointment.pool_id]
        const client = dayAgenda.clientsById[pool?.client_id]
        return {
          ...appointment,
          staff: staffById[appointment.tech_id],
          service: servicesById[appointment.service_id],
          pool,
          client,
        }
      }),
    [dayAgenda.appointments, dayAgenda.clientsById, dayAgenda.poolsById, servicesById, staffById],
  )
  const activeAppointment = useMemo(
    () => sortAppointments(enrichedAppointments).find((appointment) => appointment.status === 'in_progress') ?? null,
    [enrichedAppointments],
  )
  const detail = useAppointmentDetail(view === 'day' ? activeAppointment?.pool_id ?? null : null)
  const visibleAppointments = useMemo(
    () =>
      sortAppointments(enrichedAppointments).filter(
        (appointment) =>
          (status === 'active' ? occupiesStaff(appointment) : appointment.status === status) &&
          appointmentMatchesSearch(appointment, searchTerm),
      ),
    [enrichedAppointments, searchTerm, status],
  )

  function changeDate(offset) {
    const nextDateKey = offset === 0 ? todayKey : shiftDateKey(dateKey, offset)
    setSearchParams(createDaySearchParams(nextDateKey))
  }

  function changeMonth(offset) {
    const nextMonthKey = offset === 0 ? todayKey.slice(0, 7) : shiftMonthKey(monthKey, offset)
    setSearchParams(createMonthSearchParams(nextMonthKey))
  }

  function openDay(nextDateKey) {
    setSearchParams(createDaySearchParams(nextDateKey))
  }

  function changeWeek(offset) {
    const nextWeekKey =
      offset === 0 ? getWeekStartDateKey(todayKey) : shiftWeekKey(weekKey, offset)
    closeDialog()
    setSearchParams(createWeekSearchParams(nextWeekKey))
  }

  function weekAnchorForMonth() {
    return monthKey === todayKey.slice(0, 7) ? todayKey : `${monthKey}-01`
  }

  function printSchedule() {
    window.print()
  }

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
      // Abre o dia do novo agendamento: a subscrição desse dia apresenta-o de imediato (US06).
      openDay(dateKeyOf(payload.date))
      setNotice(`Agendamento criado para ${formatDateTime(payload.date)}.`)
    }
    return saved
  }

  async function handleReschedule(payload) {
    const saved = await actions.reschedule(dialog.id, payload)
    if (saved) {
      setDialog(null)
      openDay(dateKeyOf(payload.date))
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

  const monthAppointments = useMemo(() => {
    const monthStart = `${monthKey}-01`
    const nextMonthStart = `${shiftMonthKey(monthKey, 1)}-01`
    return monthAgenda.appointments.filter((appointment) => {
      const appointmentDateKey = dateKeyOf(appointment.date)
      return appointmentDateKey >= monthStart && appointmentDateKey < nextMonthStart
    })
  }, [monthAgenda.appointments, monthKey])

  const specialtyOptions = useMemo(() => {
    const specialties = new Set(
      dayAgenda.staff.flatMap((person) => (Array.isArray(person.specialties) ? person.specialties : [])),
    )
    return [...specialties]
      .sort((left, right) => left.localeCompare(right, 'pt-PT'))
      .map((value) => ({
        value,
        label: servicesById[value]?.name ?? specialtyLabel(value),
      }))
  }, [dayAgenda.staff, servicesById])

  const visibleMonthAppointments = useMemo(
    () =>
      monthAppointments.filter((appointment) => {
        const statusMatches =
          monthStatus === 'all' ||
          (monthStatus === 'not_cancelled'
            ? appointment.status !== 'cancelled'
            : appointment.status === monthStatus)
        const specialtyMatches =
          specialtyFilter === 'all' ||
          (Array.isArray(staffById[appointment.tech_id]?.specialties) &&
            staffById[appointment.tech_id].specialties.includes(specialtyFilter))
        return statusMatches && specialtyMatches
      }),
    [monthAppointments, monthStatus, specialtyFilter, staffById],
  )

  const monthDays = useMemo(() => getMonthGridDays(monthKey), [monthKey])
  const monthError = monthAgenda.error
  const monthLoading = monthAgenda.loading || dayAgenda.metadataLoading
  const visibleWeekAppointments = useMemo(
    () =>
      weekAgenda.appointments.filter(
        (appointment) =>
          monthStatus === 'all' ||
          (monthStatus === 'not_cancelled'
            ? appointment.status !== 'cancelled'
            : appointment.status === monthStatus),
      ),
    [monthStatus, weekAgenda.appointments],
  )
  const weekError = weekAgenda.error || dayAgenda.metadataError
  const weekLoading = weekAgenda.loading || dayAgenda.metadataLoading
  const weekTabKey =
    view === 'month'
      ? getWeekStartDateKey(weekAnchorForMonth())
      : view === 'day'
        ? getWeekStartDateKey(dateKey)
        : weekKey
  // Data inicial do novo agendamento: o dia aberto (vista dia) ou o início da semana aberta (vista
  // semana), desde que não seja no passado; caso contrário, hoje.
  const viewedDateKey = view === 'day' ? dateKey : view === 'week' ? weekKey : null
  const defaultCreateDateKey = viewedDateKey && viewedDateKey >= todayKey ? viewedDateKey : todayKey

  return (
    <div className="space-y-5">
      <AgendaHeader
        onPrint={printSchedule}
        onCreate={() => openDialog('create')}
        onWeekNavigate={closeDialog}
        createDisabled={dayAgenda.metadataLoading}
        view={view}
        dateKey={dateKey}
        monthKey={monthKey}
        weekKey={weekTabKey}
        todayKey={todayKey}
      />
      <Notice message={notice} onClose={clearNotice} />

      <div
        id="agenda-view-panel"
        role="tabpanel"
        aria-labelledby={`agenda-tab-${view}`}
        tabIndex={0}
        className="space-y-5 focus:outline-none"
      >
      {view === 'day' ? (
        <>
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

          {dayAgenda.error && <ErrorAlert message={dayAgenda.error} />}
          {dayAgenda.loading ? (
            <LoadingSpinner label="A carregar a agenda do dia..." />
          ) : dayAgenda.error ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-600">A agenda não está disponível. Tente atualizar a consulta.</p>
              <button type="button" onClick={dayAgenda.reload} className={`${SECONDARY_BUTTON} mt-3`}>
                Atualizar Agora
              </button>
            </div>
          ) : (
            <>
              <AgendaStats
                appointments={dayAgenda.appointments}
                staffById={staffById}
              />
              <div className="print:hidden">
                <button type="button" onClick={dayAgenda.reload} className={SECONDARY_BUTTON}>
                  Atualizar Agora
                </button>
              </div>
              <DailyTimeline
                dateKey={dateKey}
                appointments={visibleAppointments}
                staff={dayAgenda.staff}
                staffById={staffById}
                poolsById={dayAgenda.poolsById}
                clientsById={dayAgenda.clientsById}
                servicesById={servicesById}
                now={now}
                hasAnyAppointments={dayAgenda.appointments.length > 0}
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
        </>
      ) : view === 'week' ? (
        <>
          <WeekToolbar
            weekKey={weekKey}
            currentWeekKey={getWeekStartDateKey(todayKey)}
            onWeekChange={changeWeek}
            statusFilter={monthStatus}
            onStatusFilterChange={setMonthStatus}
            visibleCount={
              weekLoading || weekError || weekAgenda.warning
                ? null
                : visibleWeekAppointments.length
            }
            countMessage={
              weekLoading ? 'A carregar contagens...' : 'Contagens indisponíveis'
            }
          />
          <MonthLegend />
          {weekLoading ? (
            <LoadingSpinner label="A carregar a grelha semanal..." />
          ) : weekError ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <ErrorAlert message={weekError} />
              <button
                type="button"
                onClick={() => {
                  dayAgenda.reload()
                  weekAgenda.reload()
                }}
                className={`${SECONDARY_BUTTON} mt-3`}
              >
                Tentar novamente
              </button>
            </div>
          ) : weekAgenda.warning ? (
            <div role="alert" className="rounded-2xl border border-primary/40 bg-background p-5 text-sm text-slate-700">
              {weekAgenda.warning}
            </div>
          ) : (
            <>
              <WeekGrid
                weekKey={weekKey}
                appointments={visibleWeekAppointments}
                staff={dayAgenda.staff}
                staffById={staffById}
                servicesById={servicesById}
                todayKey={todayKey}
                onDaySelect={openDay}
              />
              <WeekAgendaList
                appointments={visibleWeekAppointments}
                staffById={staffById}
                servicesById={servicesById}
                onDaySelect={openDay}
              />
            </>
          )}
        </>
      ) : (
        <>
          <MonthToolbar
            monthKey={monthKey}
            currentMonthKey={todayKey.slice(0, 7)}
            onMonthChange={changeMonth}
            statusFilter={monthStatus}
            onStatusFilterChange={setMonthStatus}
            specialtyFilter={specialtyFilter}
            specialtyOptions={specialtyOptions}
            onSpecialtyFilterChange={setSpecialtyFilter}
            visibleCount={
              monthLoading || monthError || monthAgenda.warning
                ? null
                : visibleMonthAppointments.length
            }
            countMessage={
              monthLoading ? 'A carregar contagens...' : 'Contagens indisponíveis'
            }
          />
          <MonthLegend />
          {dayAgenda.metadataError && <ErrorAlert message={dayAgenda.metadataError} />}
          {monthLoading ? (
            <LoadingSpinner label="A carregar a grelha mensal..." />
          ) : monthError ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <ErrorAlert message={monthError} />
              <button type="button" onClick={monthAgenda.reload} className={`${SECONDARY_BUTTON} mt-3`}>
                Tentar novamente
              </button>
            </div>
          ) : monthAgenda.warning ? (
            <div role="alert" className="rounded-2xl border border-primary/40 bg-background p-5 text-sm text-slate-700">
              {monthAgenda.warning}
            </div>
          ) : (
            <>
              <MonthGrid
                monthKey={monthKey}
                appointments={visibleMonthAppointments}
                staffById={staffById}
                servicesById={servicesById}
                todayKey={todayKey}
                onDaySelect={openDay}
              />
              <MonthAgendaList
                monthDays={monthDays}
                appointments={visibleMonthAppointments}
                staffById={staffById}
                servicesById={servicesById}
                onDaySelect={openDay}
              />
            </>
          )}
        </>
      )}
      </div>

      {dialog?.type === 'create' && (
        <AppointmentFormModal
          initialDateKey={defaultCreateDateKey}
          todayKey={todayKey}
          staff={dayAgenda.staff}
          services={dayAgenda.services}
          servicesById={servicesById}
          onSubmit={handleCreate}
          error={actions.error}
          onDismissError={actions.clearError}
          onClose={closeDialog}
        />
      )}
      {view !== 'week' && dialog?.type === 'detail' && selectedAppointment && (
        <AppointmentDetailModal
          appointment={selectedAppointment}
          servicesById={servicesById}
          onReschedule={() => openDialog('reschedule', selectedAppointment.id)}
          onCancel={() => openDialog('cancel', selectedAppointment.id)}
          onClose={closeDialog}
        />
      )}
      {view !== 'week' && dialog?.type === 'reschedule' && selectedAppointment && (
        <AppointmentFormModal
          key={selectedAppointment.id}
          appointment={selectedAppointment}
          todayKey={todayKey}
          staff={dayAgenda.staff}
          services={dayAgenda.services}
          servicesById={servicesById}
          onSubmit={handleReschedule}
          error={actions.error}
          onDismissError={actions.clearError}
          onClose={closeDialog}
        />
      )}
      {view !== 'week' && dialog?.type === 'cancel' && selectedAppointment && (
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
