import { useState } from 'react'
import ErrorAlert from '../../../shared/components/ErrorAlert'
import FormField from '../../../shared/components/FormField'
import Modal from '../../../shared/components/Modal'
import { INPUT_CLASS, PRIMARY_BUTTON, SECONDARY_BUTTON } from '../../../shared/components/uiClasses'
import { TICKET_CATEGORY_LABELS } from '../utils/labels'
import { validateTicketForm } from '../utils/ticketValidation'

const EMPTY_FORM = {
  client_id: '',
  pool_id: '',
  category: 'quote',
  description: '',
}

export default function TicketFormModal({
  clients,
  clientsHasMore,
  clientsLoading,
  pools,
  poolsLoading,
  poolsClientId,
  error,
  onDismissError,
  onLoadMoreClients,
  onClientChange,
  onSubmit,
  onClose,
}) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [submissionError, setSubmissionError] = useState('')
  const [saving, setSaving] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((previous) => ({
      ...previous,
      [name]: value,
      ...(name === 'client_id' ? { pool_id: '' } : {}),
    }))
    setErrors((previous) => ({ ...previous, [name]: '' }))
    if (name === 'client_id') onClientChange(value)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const validationErrors = validateTicketForm(form, pools)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setSaving(true)
    setSubmissionError('')
    try {
      const saved = await onSubmit({
        client_id: form.client_id,
        pool_id: form.pool_id,
        category: form.category,
        description: form.description.trim(),
      })
      if (saved) onClose()
    } catch (error) {
      console.error(error)
      setSubmissionError('Não foi possível guardar o pedido manual.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title="Novo pedido manual" description="Registe um pedido com a mesma estrutura dos pedidos recebidos na aplicação." onClose={saving ? () => {} : onClose} size="lg">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <ErrorAlert message={error || submissionError} onClose={() => {
          onDismissError()
          setSubmissionError('')
        }} />

        <FormField id="manual-ticket-client" label="Cliente" required error={errors.client_id}>
          {(fieldProps) => (
            <select
              {...fieldProps}
              name="client_id"
              value={form.client_id}
              onChange={handleChange}
              disabled={clientsLoading}
              className={INPUT_CLASS}
            >
              <option value="">Selecione um cliente</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          )}
        </FormField>
        {clientsHasMore && (
          <button type="button" onClick={onLoadMoreClients} disabled={clientsLoading} className={SECONDARY_BUTTON}>
            {clientsLoading ? 'A carregar...' : 'Carregar mais clientes'}
          </button>
        )}

        <FormField id="manual-ticket-pool" label="Piscina" required error={errors.pool_id}>
          {(fieldProps) => (
            <select
              {...fieldProps}
              name="pool_id"
              value={form.pool_id}
              onChange={handleChange}
              disabled={!form.client_id || poolsLoading || poolsClientId !== form.client_id}
              className={INPUT_CLASS}
            >
              <option value="">{poolsLoading ? 'A carregar piscinas...' : 'Selecione uma piscina'}</option>
              {pools.map((pool) => (
                <option key={pool.id} value={pool.id}>
                  {pool.name || pool.local_address}
                </option>
              ))}
            </select>
          )}
        </FormField>

        <FormField id="manual-ticket-category" label="Tipo de pedido" required error={errors.category}>
          {(fieldProps) => (
            <select
              {...fieldProps}
              name="category"
              value={form.category}
              onChange={handleChange}
              className={INPUT_CLASS}
            >
              {Object.entries(TICKET_CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          )}
        </FormField>

        <FormField
          id="manual-ticket-description"
          label="Descrição"
          required
          error={errors.description}
          hint="Entre 10 e 1000 caracteres."
        >
          {(fieldProps) => (
            <textarea
              {...fieldProps}
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={5}
              maxLength={1000}
              className={INPUT_CLASS}
            />
          )}
        </FormField>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} disabled={saving} className={SECONDARY_BUTTON}>
            Cancelar
          </button>
          <button type="submit" disabled={saving} className={PRIMARY_BUTTON}>
            {saving ? 'A guardar...' : 'Criar pedido'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
