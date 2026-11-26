import { useMemo, useState } from 'react'
import ErrorAlert from '../../../shared/components/ErrorAlert'
import FormField from '../../../shared/components/FormField'
import Modal from '../../../shared/components/Modal'
import {
  DANGER_BUTTON,
  INPUT_CLASS,
  INPUT_ERROR_CLASS,
  PRIMARY_BUTTON,
  SECONDARY_BUTTON,
} from '../../../shared/components/uiClasses'
import { useClientSearch } from '../hooks/useClientSearch'
import { useSchedulingContext } from '../hooks/useSchedulingContext'
import {
  NOTES_MAX_LENGTH,
  eligibleStaff,
  formInterval,
  newFormState,
  toCreatePayload,
  toFormState,
  toReschedulePayload,
  validateAppointmentForm,
  workdayEndMessage,
} from '../utils/appointmentForm'
import { formatDateTime, formatTime } from '../utils/date'
import { formatDuration, serviceTypeLabel, staffRoleLabel } from '../utils/labels'
import { busyStaff, endsAfterWorkday, serviceDuration } from '../utils/schedule'
import { hasStockRisk, serviceConsumableDeltas, stockLines } from '../utils/stock'
import ClientPoolPicker from './ClientPoolPicker'
import RequiredConsumablesList from './RequiredConsumablesList'
import SchedulingAlerts from './SchedulingAlerts'

const NO_DELTAS = []

/**
 * Formulário "Novo agendamento" (e "Reagendar", quando recebe `appointment`).
 * A página remonta-o com `key`, por isso o estado inicial vem só das props (sem efeitos a copiar props).
 * As leituras dependentes da escolha (piscinas, stock, agenda do dia) vêm dos hooks do módulo.
 */
export default function AppointmentFormModal({
  appointment = null,
  initialDateKey,
  todayKey,
  staff,
  services,
  servicesById,
  onSubmit,
  error,
  onDismissError,
  onClose,
}) {
  const isReschedule = Boolean(appointment)
  const [form, setForm] = useState(() => (isReschedule ? toFormState(appointment) : newFormState(initialDateKey)))
  const [selectedClient, setSelectedClient] = useState(() => (isReschedule ? appointment.client ?? null : null))
  const [searchTerm, setSearchTerm] = useState('')
  const [showAllStaff, setShowAllStaff] = useState(false)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const service = servicesById[form.service_id] ?? null
  const deltas = useMemo(
    () => (isReschedule ? NO_DELTAS : serviceConsumableDeltas(service)),
    [isReschedule, service],
  )
  const consumableIds = useMemo(() => deltas.map((item) => item.consumable_id), [deltas])

  const search = useClientSearch(selectedClient ? '' : searchTerm)
  const context = useSchedulingContext({
    clientId: isReschedule ? null : form.client_id,
    consumableIds,
    dateKey: form.date,
  })

  const interval = formInterval(form, service, appointment, servicesById)
  const busy = busyStaff(
    context.dayAppointments,
    { start: interval?.start, end: interval?.end, excludeId: appointment?.id },
    servicesById,
  )
  const conflict = form.tech_id ? busy[form.tech_id] ?? null : null
  const lateEnd = endsAfterWorkday(interval)
  const lines = stockLines(deltas, context.consumablesById)
  const stockRisk = !context.consumablesLoading && hasStockRisk(lines)

  const activeServices = services
    .filter((item) => item.is_active !== false)
    .toSorted((left, right) => (left.name ?? '').localeCompare(right.name ?? '', 'pt-PT'))
  const staffOptions = eligibleStaff(staff, service, showAllStaff)
  const selectedStaff = staff.find((person) => person.id === form.tech_id) ?? null
  const staffList =
    selectedStaff && !staffOptions.some((person) => person.id === selectedStaff.id)
      ? [selectedStaff, ...staffOptions]
      : staffOptions

  function handleChange(event) {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
    setErrors((previous) => ({ ...previous, [name]: undefined }))
  }

  function selectClient(client) {
    setSelectedClient(client)
    setForm((previous) => ({ ...previous, client_id: client.id, pool_id: '' }))
    setErrors((previous) => ({ ...previous, client_id: undefined }))
  }

  function clearClient() {
    setSelectedClient(null)
    setForm((previous) => ({ ...previous, client_id: '', pool_id: '' }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const validation = validateAppointmentForm(form, { service, interval, isReschedule })
    if (!validation.time && !validation.service_id && !interval) {
      validation.time = 'Não foi possível calcular a hora de fim.'
    }
    if (Object.keys(validation).length === 0 && conflict) {
      validation.tech_id = 'Este colaborador já tem um serviço neste horário.'
    }
    setErrors(validation)
    if (Object.keys(validation).length > 0) return

    setSaving(true)
    try {
      const payload = isReschedule ? toReschedulePayload(form, interval) : toCreatePayload(form, interval)
      const saved = await onSubmit(payload)
      // Se falhou (ex.: conflito detetado só na nova leitura), atualiza a disponibilidade mostrada.
      if (!saved) context.refreshDay()
    } finally {
      setSaving(false)
    }
  }

  const submitLabel = saving
    ? 'A gravar...'
    : isReschedule
      ? 'Guardar reagendamento'
      : stockRisk
        ? 'Agendar com alerta de stock'
        : 'Agendar intervenção'

  return (
    <Modal
      title={isReschedule ? 'Reagendar intervenção' : 'Novo agendamento de serviço'}
      description="Horários em Europe/Lisbon. O fim é calculado pela duração prevista do serviço."
      onClose={saving ? () => {} : onClose}
      size="lg"
    >
      <form noValidate onSubmit={handleSubmit} className="space-y-5">
        <ErrorAlert message={error} onClose={onDismissError} />

        <SchedulingAlerts conflict={conflict} staffName={selectedStaff?.name} stockLines={lines} />

        {isReschedule ? (
          <dl className="grid gap-3 rounded-xl bg-background p-4 text-sm md:grid-cols-3">
            <div>
              <dt className="text-xs text-slate-500">Cliente</dt>
              <dd className="font-medium text-slate-800">{appointment.client?.name ?? 'Cliente não identificado'}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Piscina</dt>
              <dd className="font-medium text-slate-800">
                {appointment.pool?.name ?? appointment.pool?.local_address ?? 'Piscina não identificada'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Serviço</dt>
              <dd className="font-medium text-slate-800">{service?.name ?? 'Serviço não identificado'}</dd>
            </div>
            <div className="md:col-span-3">
              <dt className="text-xs text-slate-500">Agendado atualmente para</dt>
              <dd className="font-medium text-slate-800">{formatDateTime(appointment.date)}</dd>
            </div>
          </dl>
        ) : (
          <>
            <ClientPoolPicker
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              search={search}
              selectedClient={selectedClient}
              onSelectClient={selectClient}
              onClearClient={clearClient}
              pools={context.pools}
              poolsLoading={context.poolsLoading}
              poolsError={context.poolsError}
              poolId={form.pool_id}
              onChange={handleChange}
              errors={errors}
              disabled={saving}
            />
            <FormField id="appointment-service" label="Tipo de intervenção" required error={errors.service_id}>
              {(fieldProps) => (
                <select
                  {...fieldProps}
                  name="service_id"
                  value={form.service_id}
                  onChange={handleChange}
                  disabled={saving}
                  className={`${INPUT_CLASS} ${errors.service_id ? INPUT_ERROR_CLASS : ''}`}
                >
                  <option value="">Selecione o serviço</option>
                  {activeServices.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} · {serviceTypeLabel(item.type)} · {formatDuration(serviceDuration(item))}
                    </option>
                  ))}
                </select>
              )}
            </FormField>
          </>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <FormField id="appointment-date" label="Data prevista" required error={errors.date}>
            {(fieldProps) => (
              <input
                {...fieldProps}
                type="date"
                name="date"
                min={todayKey}
                value={form.date}
                onChange={handleChange}
                disabled={saving}
                className={`${INPUT_CLASS} ${errors.date ? INPUT_ERROR_CLASS : ''}`}
              />
            )}
          </FormField>
          <FormField id="appointment-time" label="Hora de início" required error={errors.time}>
            {(fieldProps) => (
              <input
                {...fieldProps}
                type="time"
                name="time"
                step={900}
                value={form.time}
                onChange={handleChange}
                disabled={saving}
                className={`${INPUT_CLASS} ${errors.time ? INPUT_ERROR_CLASS : ''}`}
              />
            )}
          </FormField>
          <div>
            <p className="text-sm font-medium text-slate-700">Hora de fim estimada</p>
            <p
              className={`mt-1 rounded-lg border px-3 py-2 text-sm ${
                lateEnd ? 'border-red-300 bg-red-50 text-red-700' : 'border-slate-200 bg-slate-50 text-slate-700'
              }`}
              aria-live="polite"
            >
              {interval ? `${formatTime(interval.end)} (${formatDuration(interval.duration)})` : '—'}
            </p>
            {lateEnd && !errors.time && (
              <p className="mt-1 text-xs text-red-600">{workdayEndMessage(interval)}</p>
            )}
          </div>
        </div>

        <FormField
          id="appointment-staff"
          label="Técnico ou comercial responsável"
          required
          error={errors.tech_id || context.dayError}
          hint={context.dayLoading ? 'A verificar a disponibilidade da equipa...' : undefined}
        >
          {(fieldProps) => (
            <div>
              <select
                {...fieldProps}
                name="tech_id"
                value={form.tech_id}
                onChange={handleChange}
                disabled={saving}
                className={`${INPUT_CLASS} ${errors.tech_id || conflict ? INPUT_ERROR_CLASS : ''}`}
              >
                <option value="">Selecione o colaborador</option>
                {staffList.map((person) => {
                  const personBusy = busy[person.id]
                  return (
                    <option key={person.id} value={person.id}>
                      {person.name} · {staffRoleLabel(person.role)}
                      {personBusy ? ` (ocupado ${formatTime(personBusy.start)}–${formatTime(personBusy.end)})` : ''}
                    </option>
                  )
                })}
              </select>
              {service && (
                <label className="mt-2 inline-flex items-center gap-2 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={showAllStaff}
                    onChange={(event) => setShowAllStaff(event.target.checked)}
                    disabled={saving}
                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/40"
                  />
                  Mostrar todos os colaboradores (não só{' '}
                  {service.type === 'commercial_survey' ? 'comerciais' : 'técnicos'})
                </label>
              )}
            </div>
          )}
        </FormField>

        <FormField
          id="appointment-notes"
          label="Notas"
          optional
          error={errors.notes}
          hint={`${form.notes.length}/${NOTES_MAX_LENGTH} caracteres`}
        >
          {(fieldProps) => (
            <textarea
              {...fieldProps}
              name="notes"
              rows={3}
              value={form.notes}
              onChange={handleChange}
              disabled={saving}
              className={`${INPUT_CLASS} ${errors.notes ? INPUT_ERROR_CLASS : ''}`}
            />
          )}
        </FormField>

        {!isReschedule && service && (
          <RequiredConsumablesList
            lines={lines}
            loading={context.consumablesLoading}
            error={context.consumablesError}
          />
        )}

        <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} disabled={saving} className={SECONDARY_BUTTON}>
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving || Boolean(conflict)}
            className={stockRisk && !isReschedule ? DANGER_BUTTON : PRIMARY_BUTTON}
          >
            {stockRisk && !isReschedule && !saving && <span aria-hidden="true">⚠</span>}
            {submitLabel}
          </button>
        </div>
      </form>
    </Modal>
  )
}
