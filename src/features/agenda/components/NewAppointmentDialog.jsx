import { useState } from 'react'
import ErrorAlert from '../../../shared/components/ErrorAlert'
import LoadingSpinner from '../../../shared/components/LoadingSpinner'
import Modal from '../../../shared/components/Modal'
import { useAppointmentActions } from '../hooks/useAppointmentActions'
import { useSchedulingReferences } from '../hooks/useSchedulingReferences'
import { dateKeyInLisbon } from '../utils/date'
import AppointmentFormModal from './AppointmentFormModal'

const TITLE = 'Novo agendamento de serviço'

/**
 * Janela "Novo agendamento" pronta a usar fora da agenda (ex.: no dashboard). Reutiliza o mesmo
 * formulário, as mesmas validações (sobreposição, 19:00, stock projetado) e o mesmo serviço da agenda,
 * por isso a escrita em `appointments` continua só no `agendaService` (D-10).
 * `onCreated(payload)` é chamado depois de gravar com sucesso.
 */
export default function NewAppointmentDialog({ onCreated, onClose }) {
  const [todayKey] = useState(() => dateKeyInLisbon())
  const references = useSchedulingReferences(true)
  const actions = useAppointmentActions(references.servicesById)

  async function handleSubmit(payload) {
    const saved = await actions.create(payload)
    if (saved) onCreated(payload)
    return saved
  }

  if (references.loading || references.error) {
    return (
      <Modal title={TITLE} onClose={onClose}>
        {references.error ? (
          <ErrorAlert message={references.error} />
        ) : (
          <LoadingSpinner label="A carregar técnicos e serviços..." />
        )}
      </Modal>
    )
  }

  return (
    <AppointmentFormModal
      initialDateKey={todayKey}
      todayKey={todayKey}
      staff={references.staff}
      services={references.services}
      servicesById={references.servicesById}
      onSubmit={handleSubmit}
      error={actions.error}
      onDismissError={actions.clearError}
      onClose={onClose}
    />
  )
}
