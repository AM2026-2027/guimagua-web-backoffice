import { useState } from 'react'
import ErrorAlert from '../../../shared/components/ErrorAlert'
import Modal from './Modal'
import { DANGER_BUTTON, PRIMARY_BUTTON, SECONDARY_BUTTON } from './styles'

/** Confirmação explícita antes de desativar/reativar. `onConfirm` devolve true/false. */
export default function ConfirmDialog({
  title,
  message,
  confirmLabel,
  danger = false,
  error,
  onDismissError,
  onConfirm,
  onCancel,
}) {
  const [working, setWorking] = useState(false)

  async function handleConfirm() {
    setWorking(true)
    try {
      await onConfirm()
    } finally {
      setWorking(false)
    }
  }

  return (
    <Modal title={title} onClose={working ? () => {} : onCancel} size="sm">
      <div className="space-y-4">
        <p className="text-sm text-slate-600">{message}</p>
        <ErrorAlert message={error} onClose={onDismissError} />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onCancel} disabled={working} className={SECONDARY_BUTTON}>
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={working}
            className={danger ? DANGER_BUTTON : PRIMARY_BUTTON}
          >
            {working ? 'A processar...' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}
