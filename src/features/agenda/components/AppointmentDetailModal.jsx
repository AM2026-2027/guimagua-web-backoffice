import Modal from '../../../shared/components/Modal'
import { DANGER_BUTTON, PRIMARY_BUTTON, SECONDARY_BUTTON } from '../../../shared/components/uiClasses'
import { formatDateTime, formatTime } from '../utils/date'
import { appointmentStatusLabel, serviceTypeLabel, staffRoleLabel } from '../utils/labels'
import { appointmentInterval } from '../utils/schedule'

/**
 * Detalhe de um agendamento da timeline. Só os agendamentos `scheduled` podem ser reagendados ou
 * cancelados; os que estão em curso ou concluídos são geridos pela App Guimágua.
 */
export default function AppointmentDetailModal({ appointment, servicesById, onReschedule, onCancel, onClose }) {
  const interval = appointmentInterval(appointment, servicesById)
  const canManage = appointment.status === 'scheduled'
  const rows = [
    ['Estado', appointmentStatusLabel(appointment.status)],
    [
      'Horário',
      interval ? `${formatDateTime(interval.start)} – ${formatTime(interval.end)}` : formatDateTime(appointment.date),
    ],
    ['Cliente', appointment.client?.name ?? 'Cliente não identificado'],
    ['Piscina', appointment.pool?.name ?? appointment.pool?.local_address ?? 'Piscina não identificada'],
    ['Morada', appointment.pool?.local_address ?? '—'],
    [
      'Serviço',
      appointment.service
        ? `${appointment.service.name} · ${serviceTypeLabel(appointment.service.type)}`
        : 'Serviço não identificado',
    ],
    [
      'Responsável',
      appointment.staff
        ? `${appointment.staff.name} · ${staffRoleLabel(appointment.staff.role)}`
        : 'Colaborador não identificado',
    ],
    ['Notas', appointment.notes || '—'],
  ]

  return (
    <Modal title="Detalhe do agendamento" description={`ID ${appointment.id}`} onClose={onClose}>
      <dl className="grid gap-3 text-sm sm:grid-cols-[9rem_minmax(0,1fr)]">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-slate-500">{label}</dt>
            <dd className="font-medium text-slate-800 [overflow-wrap:anywhere]">{value}</dd>
          </div>
        ))}
      </dl>
      {!canManage && (
        <p className="mt-4 rounded-lg bg-background px-3 py-2 text-xs text-slate-600">
          Só os agendamentos no estado "Agendado" podem ser reagendados ou cancelados no backoffice.
        </p>
      )}
      <div className="mt-5 flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
        <button type="button" onClick={onClose} className={SECONDARY_BUTTON}>
          Fechar
        </button>
        {canManage && (
          <>
            <button type="button" onClick={onCancel} className={DANGER_BUTTON}>
              Cancelar agendamento
            </button>
            <button type="button" onClick={onReschedule} className={PRIMARY_BUTTON}>
              Reagendar
            </button>
          </>
        )}
      </div>
    </Modal>
  )
}
