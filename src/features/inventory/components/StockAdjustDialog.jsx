import { useState } from 'react'
import ErrorAlert from '../../../shared/components/ErrorAlert'
import Modal from '../../../shared/components/Modal'
import FormField from '../../../shared/components/FormField'
import { INPUT_CLASS, INPUT_ERROR_CLASS, PRIMARY_BUTTON, SECONDARY_BUTTON } from '../../../shared/components/uiClasses'
import { formatQuantity } from '../utils/labels'
import { stockAfterAdjustment } from '../utils/stock'
import { validateAdjustment } from '../utils/consumableValidation'

/**
 * Entrada ou saída de stock físico. O resultado é calculado na renderização e uma saída que deixasse
 * o stock negativo é bloqueada (o serviço volta a verificar na transação).
 * Cada ajuste fica registado como movimento (entrada/saída) com o motivo indicado.
 * `onSubmit(delta, reason)` devolve true/false.
 */
export default function StockAdjustDialog({ consumable, serverError, onDismissError, onSubmit, onClose }) {
  const [direction, setDirection] = useState('in')
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const amount = Number(String(quantity).replace(',', '.'))
  const resulting = Number.isInteger(amount) && amount > 0 ? stockAfterAdjustment(consumable.stock_quantity, direction, amount) : undefined

  async function handleSubmit(event) {
    event.preventDefault()
    const message = validateAdjustment(quantity, resulting ?? null)
    setError(message)
    if (message) return
    setSaving(true)
    try {
      await onSubmit(direction === 'out' ? -amount : amount, reason)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={`Ajustar stock: ${consumable.name}`} description={`SKU ${consumable.sku ?? '—'}`} onClose={saving ? () => {} : onClose} size="sm">
      <form noValidate onSubmit={handleSubmit} className="space-y-4">
        <fieldset>
          <legend className="text-sm font-medium text-slate-700">Tipo de movimento</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {[
              { value: 'in', label: 'Entrada (+)' },
              { value: 'out', label: 'Saída (−)' },
            ].map((option) => (
              <label
                key={option.value}
                className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-primary/40 ${
                  direction === option.value ? 'border-primary bg-primary/5 text-primary' : 'border-slate-300 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="direction"
                  value={option.value}
                  checked={direction === option.value}
                  onChange={(event) => {
                    setDirection(event.target.value)
                    setError('')
                  }}
                  className="sr-only"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <FormField id="adjust-quantity" label={`Quantidade (${consumable.unit || 'un'})`} required error={error}>
          {(field) => (
            <input
              {...field}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              autoFocus
              value={quantity}
              onChange={(event) => {
                setQuantity(event.target.value)
                setError('')
              }}
              className={`${INPUT_CLASS} ${error ? INPUT_ERROR_CLASS : ''}`}
            />
          )}
        </FormField>

        <FormField
          id="adjust-reason"
          label="Motivo"
          optional
          hint={direction === 'in' ? 'Ex.: fatura do fornecedor n.º 123.' : 'Ex.: material danificado, consumo interno.'}
        >
          {(field) => (
            <input
              {...field}
              maxLength={200}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className={INPUT_CLASS}
            />
          )}
        </FormField>

        <dl className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
          <div>
            <dt className="text-slate-500">Stock físico atual</dt>
            <dd className="font-semibold text-slate-800">{formatQuantity(consumable.stock_quantity, consumable.unit)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Depois do ajuste</dt>
            <dd className={`font-semibold ${resulting === null ? 'text-red-600' : 'text-slate-800'}`}>
              {resulting === undefined ? '—' : resulting === null ? 'Negativo (bloqueado)' : formatQuantity(resulting, consumable.unit)}
            </dd>
          </div>
        </dl>

        <p className="text-xs text-slate-500">O ajuste fica registado no histórico de movimentos de stock.</p>
        <ErrorAlert message={serverError} onClose={onDismissError} />

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} disabled={saving} className={SECONDARY_BUTTON}>
            Cancelar
          </button>
          <button type="submit" disabled={saving} className={PRIMARY_BUTTON}>
            {saving ? 'A guardar...' : 'Confirmar ajuste'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
