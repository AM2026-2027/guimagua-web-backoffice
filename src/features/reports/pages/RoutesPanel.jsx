import { useState } from 'react'
import LoadingSpinner from '../../../shared/components/LoadingSpinner'
import ErrorAlert from '../../../shared/components/ErrorAlert'
import { CARD_CLASS, INPUT_CLASS, LINK_BUTTON } from '../../../shared/components/uiClasses'
import { useTeamRoute } from '../hooks/useTeamRoute'
import ExportCsvButton from '../components/ExportCsvButton'
import RouteDayView from '../components/RouteDayView'
import { csvFileName } from '../utils/csv'
import { checkinDelayMinutes, formatTime, shiftInputDate, todayInput } from '../utils/dates'
import { appointmentStatusLabel } from '../utils/labels'

const ROUTE_CSV_COLUMNS = [
  { header: 'Hora prevista', value: (row) => formatTime(row.date) },
  { header: 'Check-in', value: (row) => formatTime(row.checkin_timestamp) },
  { header: 'Atraso (min)', value: (row) => checkinDelayMinutes(row) ?? '' },
  { header: 'Cliente', value: (row) => row.clientName },
  { header: 'Piscina', value: (row) => row.poolName },
  { header: 'Serviço', value: (row) => row.serviceName },
  { header: 'Estado', value: (row) => appointmentStatusLabel(row.status) },
]

/** Separador "Rotas da equipa" (RF-WEB07): visitas de um técnico num dia, por ordem de hora. */
export default function RoutesPanel({ reference }) {
  const [techId, setTechId] = useState('')
  const [day, setDay] = useState('')
  const route = useTeamRoute(techId || null, day || null, reference)
  const techName = reference.staffById.get(techId)?.name

  return (
    <div className="space-y-4">
      <div className={`${CARD_CLASS} flex flex-col gap-3 p-4 lg:flex-row lg:items-end`}>
        <div className="lg:w-64">
          <label htmlFor="routes-tech" className="text-sm font-medium text-slate-700">
            Técnico
          </label>
          <select id="routes-tech" value={techId} onChange={(event) => setTechId(event.target.value)} className={INPUT_CLASS}>
            <option value="">— Escolha —</option>
            {reference.technicians.map((tech) => (
              <option key={tech.id} value={tech.id}>
                {tech.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="routes-day" className="text-sm font-medium text-slate-700">
            Dia
          </label>
          <input id="routes-day" type="date" value={day} onChange={(event) => setDay(event.target.value)} className={INPUT_CLASS} />
        </div>
        <div className="flex gap-3 pb-2 text-sm">
          <button type="button" onClick={() => setDay((current) => shiftInputDate(current || todayInput(Date.now()), -1))} className={LINK_BUTTON} aria-label="Dia anterior">
            ← Anterior
          </button>
          <button type="button" onClick={() => setDay(todayInput(Date.now()))} className={LINK_BUTTON}>
            Hoje
          </button>
          <button type="button" onClick={() => setDay((current) => shiftInputDate(current || todayInput(Date.now()), 1))} className={LINK_BUTTON} aria-label="Dia seguinte">
            Seguinte →
          </button>
        </div>
        <div className="lg:ml-auto">
          <ExportCsvButton rows={route.visits} columns={ROUTE_CSV_COLUMNS} fileName={csvFileName(`rota-${(techName ?? 'tecnico').toLowerCase().replace(/\s+/g, '-')}`, day)} />
        </div>
      </div>

      {!route.selected ? (
        <div className={`${CARD_CLASS} p-8 text-center text-sm text-slate-500`}>Escolha um técnico e um dia para ver a rota.</div>
      ) : route.loading ? (
        <LoadingSpinner label="A carregar rota..." />
      ) : route.error ? (
        <ErrorAlert message={route.error} />
      ) : route.visits.length === 0 ? (
        <div className={`${CARD_CLASS} p-8 text-center text-sm text-slate-500`}>{techName ?? 'Este técnico'} não tem visitas neste dia.</div>
      ) : (
        <RouteDayView visits={route.visits} />
      )}
    </div>
  )
}
