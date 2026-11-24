import { useState } from 'react'
import ErrorAlert from '../../../shared/components/ErrorAlert'
import Modal from '../../../shared/components/Modal'
import FormField from '../../../shared/components/FormField'
import { INPUT_CLASS, INPUT_ERROR_CLASS, PRIMARY_BUTTON, SECONDARY_BUTTON } from '../../../shared/components/uiClasses'
import { clientToFormState, clientToPayload } from '../utils/clientForm'
import { validateClient } from '../utils/clientValidation'
import { formatClientNumber } from '../utils/labels'

/**
 * Criar/editar cliente. A página reinicia o formulário através da `key` (sem useEffect a copiar props).
 * `onSubmit(payload)` devolve true/false; em caso de falha os dados preenchidos mantêm-se (RNF-GLB03).
 */
export default function ClientFormModal({ client, serverError, onDismissError, onSubmit, onClose }) {
  const [form, setForm] = useState(() => clientToFormState(client))
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const isEdit = Boolean(client)
  // Um cliente com conta na App Cliente tem o email ligado ao Firebase Auth: não pode ser alterado aqui.
  const emailLocked = Boolean(client?.user_id)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const validation = validateClient(form)
    setErrors(validation)
    if (Object.keys(validation).length > 0) return

    setSaving(true)
    try {
      await onSubmit(clientToPayload(form))
    } finally {
      setSaving(false)
    }
  }

  const inputClass = (name) => `${INPUT_CLASS} ${errors[name] ? INPUT_ERROR_CLASS : ''}`

  return (
    <Modal
      title={isEdit ? 'Editar cliente' : 'Novo cliente'}
      description={
        isEdit
          ? `Cliente ${formatClientNumber(client.client_number)}`
          : 'O cliente fica registado sem conta. Se aderir à App Cliente com o mesmo email, define aí a sua palavra-passe.'
      }
      onClose={saving ? () => {} : onClose}
    >
      <form noValidate onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <FormField id="client-name" label="Nome completo" required error={errors.name}>
              {(field) => (
                <input
                  {...field}
                  name="name"
                  autoFocus
                  autoComplete="name"
                  value={form.name}
                  onChange={handleChange}
                  className={inputClass('name')}
                />
              )}
            </FormField>
          </div>

          <FormField
            id="client-email"
            label="Email"
            required
            error={errors.email}
            hint={emailLocked ? 'Associado à conta da App Cliente; não pode ser alterado aqui.' : undefined}
          >
            {(field) => (
              <input
                {...field}
                name="email"
                type="email"
                autoComplete="email"
                placeholder="nome@exemplo.pt"
                disabled={emailLocked}
                value={form.email}
                onChange={handleChange}
                className={inputClass('email')}
              />
            )}
          </FormField>

          <FormField id="client-phone" label="Telefone" required error={errors.phone}>
            {(field) => (
              <input
                {...field}
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+351 912 345 678"
                value={form.phone}
                onChange={handleChange}
                className={inputClass('phone')}
              />
            )}
          </FormField>

          <div className="md:col-span-2">
            <FormField id="client-address" label="Morada de faturação" required error={errors.address}>
              {(field) => (
                <input
                  {...field}
                  name="address"
                  autoComplete="street-address"
                  value={form.address}
                  onChange={handleChange}
                  className={inputClass('address')}
                />
              )}
            </FormField>
          </div>

          <FormField id="client-postal-code" label="Código postal" optional error={errors.postal_code}>
            {(field) => (
              <input
                {...field}
                name="postal_code"
                autoComplete="postal-code"
                inputMode="numeric"
                placeholder="4800-000"
                value={form.postal_code}
                onChange={handleChange}
                className={inputClass('postal_code')}
              />
            )}
          </FormField>

          <FormField id="client-city" label="Localidade" optional error={errors.city}>
            {(field) => (
              <input
                {...field}
                name="city"
                autoComplete="address-level2"
                value={form.city}
                onChange={handleChange}
                className={inputClass('city')}
              />
            )}
          </FormField>

          <FormField id="client-nif" label="NIF" optional error={errors.nif}>
            {(field) => (
              <input
                {...field}
                name="nif"
                inputMode="numeric"
                placeholder="123456789"
                value={form.nif}
                onChange={handleChange}
                className={inputClass('nif')}
              />
            )}
          </FormField>

          <div className="md:col-span-2">
            <FormField id="client-notes" label="Notas" optional error={errors.notes}>
              {(field) => (
                <textarea
                  {...field}
                  name="notes"
                  rows={3}
                  value={form.notes}
                  onChange={handleChange}
                  className={inputClass('notes')}
                />
              )}
            </FormField>
          </div>
        </div>

        {Object.keys(errors).some((key) => errors[key]) && (
          <p className="text-sm text-red-600" role="alert">
            Corrija os campos assinalados antes de guardar.
          </p>
        )}
        <ErrorAlert message={serverError} onClose={onDismissError} />

        <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
          <button type="button" onClick={onClose} disabled={saving} className={SECONDARY_BUTTON}>
            Cancelar
          </button>
          <button type="submit" disabled={saving} className={PRIMARY_BUTTON}>
            {saving ? 'A guardar...' : isEdit ? 'Guardar alterações' : 'Criar cliente'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
