import { useEffect, useMemo, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router'
import ErrorAlert from '../../../shared/components/ErrorAlert'
import LoadingSpinner from '../../../shared/components/LoadingSpinner'
import { SECONDARY_BUTTON } from '../../../shared/components/uiClasses'
import AgendaHeader from '../components/AgendaHeader'
import AgendaStats from '../components/AgendaStats'
import AgendaToolbar from '../components/AgendaToolbar'
import ActiveAppointmentPanel from '../components/ActiveAppointmentPanel'
import DailyTimeline from '../components/DailyTimeline'
import FleetTelemetryPanel from '../components/FleetTelemetryPanel'
import MonthAgendaList from '../components/MonthAgendaList'
import MonthGrid from '../components/MonthGrid'
import MonthLegend from '../components/MonthLegend'
import MonthToolbar from '../components/MonthToolbar'
import { useAppointmentDetail } from '../hooks/useAppointmentDetail'
import { useAppointments } from '../hooks/useAppointments'
import { useMonthAppointments } from '../hooks/useMonthAppointments'
import { dateKeyInLisbon, dateKeyOf, shiftDateKey } from '../utils/date'
import {
  APPOINTMENT_STATUS_OPTIONS,
  specialtyLabel,
} from '../utils/labels'
import { getMonthGridDays, shiftMonthKey } from '../utils/month'
import { sortAppointments } from '../utils/sort'
import { appointmentMatchesSearch } from '../utils/text'
import {
  createDaySearchParams,
  createMonthSearchParams,
  parseAgendaViewParams,
} from '../utils/viewParams'

export default function AgendaPage() {
  const [todayKey, setTodayKey] = useState(() => dateKeyInLisbon())
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const actualSearch = searchParams.toString()
  const viewParams = parseAgendaViewParams(searchParams, todayKey)
  const { view, dateKey, monthKey, normalizedSearch } = viewParams
  const [lastDayDateKey, setLastDayDateKey] = useState(() => dateKeyInLisbon())
  const [daySubscriptionStarted, setDaySubscriptionStarted] = useState(false)
  const [status, setStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [monthStatus, setMonthStatus] = useState('not_cancelled')
  const [specialtyFilter, setSpecialtyFilter] = useState('all')
  const [now, setNow] = useState(() => new Date())
  const daySubscriptionDateKey = view === 'day' ? dateKey : lastDayDateKey
  const dayAgenda = useAppointments(daySubscriptionDateKey, {
    enabled: view === 'day' || daySubscriptionStarted,
    loadReferences: view === 'day',
  })
  const monthAgenda = useMonthAppointments(monthKey, view === 'month', location.key)

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
          (status === 'all' || appointment.status === status) &&
          appointmentMatchesSearch(appointment, searchTerm),
      ),
    [enrichedAppointments, searchTerm, status],
  )

  function changeDate(offset) {
    const nextDateKey = offset === 0 ? todayKey : shiftDateKey(dateKey, offset)
    setLastDayDateKey(nextDateKey)
    setDaySubscriptionStarted(true)
    setSearchParams(createDaySearchParams(nextDateKey))
  }

  function changeMonth(offset) {
    const nextMonthKey = offset === 0 ? todayKey.slice(0, 7) : shiftMonthKey(monthKey, offset)
    setSearchParams(createMonthSearchParams(nextMonthKey))
  }

  function openDay(nextDateKey) {
    setLastDayDateKey(nextDateKey)
    setDaySubscriptionStarted(true)
    setSearchParams(createDaySearchParams(nextDateKey))
  }

  function prepareDayNavigation(nextDateKey) {
    setLastDayDateKey(nextDateKey)
    setDaySubscriptionStarted(true)
  }

  function prepareMonthNavigation() {
    setLastDayDateKey(dateKey)
    setDaySubscriptionStarted(true)
  }

  function printSchedule() {
    window.print()
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

  return (
    <div className="space-y-5">
      <AgendaHeader
        onPrint={printSchedule}
        view={view}
        dateKey={dateKey}
        monthKey={monthKey}
        todayKey={todayKey}
        onDayNavigate={prepareDayNavigation}
        onMonthNavigate={prepareMonthNavigation}
      />

      {view === 'day' ? (
        <>
          <AgendaToolbar
            dateKey={dateKey}
            todayKey={todayKey}
            status={status}
            statusOptions={APPOINTMENT_STATUS_OPTIONS}
            searchTerm={searchTerm}
            onDateChange={changeDate}
            onMonthNavigate={prepareMonthNavigation}
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
                servicesById={servicesById}
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
  )
}
