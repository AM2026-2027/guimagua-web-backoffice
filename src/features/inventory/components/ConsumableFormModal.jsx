import { useState } from 'react'
import ErrorAlert from '../../../shared/components/ErrorAlert'
import Modal from '../../../shared/components/Modal'
import FormField from '../../../shared/components/FormField'
import { INPUT_CLASS, INPUT_ERROR_CLASS, PRIMARY_BUTTON, SECONDARY_BUTTON } from '../../../shared/components/uiClasses'
import { CATEGORY_OPTIONS, UNIT_OPTIONS, skuPrefixFor } from '../utils/labels'
import { consumableToFormState, consumableToPayload } from '../utils/consumableForm'
import { validateConsumable } from '../utils/consumableValidation'

/**
 * Criar/editar artigo (protótipo modal-editor-artigo). Reiniciado pela `key` dada pela página.
 * - O SKU é automático: prefixo da categoria + número sequencial, atribuído ao gravar (ex.: QUI-0001).
 * - Na criação indica-se o stock físico inicial; depois, o stock só muda pelo ajuste de entrada/saída.
 * `onSubmit(payload)` devolve true/false; em caso de falha os dados preenchidos mantêm-se (RNF-GLB03).
 */
export default function ConsumableFormModal({ consumable, serverError, onDismissError, onSubmit, onClose }) {
  const [form, setForm] = useState(() => consumableToFormState(consumable))
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const isCreate = !consumable
  const prefix = skuPrefixFor(form.category)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const validation = validateConsumable(form, { isCreate })
    setErrors(validation)
    if (Object.keys(validation).length > 0) return
    setSaving(true)
    try {
      await onSubmit(consumableToPayload(form, { isCreate }))
    } finally {
      setSaving(false)
    }
  }

  const inputClass = (name) => `${INPUT_CLASS} ${errors[name] ? INPUT_ERROR_CLASS : ''}`

  return (
    <Modal
      title={isCreate ? 'Novo artigo' : `Editar artigo ${consumable.sku ?? ''}`}
      description={isCreate ? 'Todos os campos são obrigatórios. O SKU é atribuído automaticamente a partir da categoria.' : consumable.name}
      onClose={saving ? () => {} : onClose}
      size="lg"
    >
      <form noValidate onSubmit={handleSubmit} className="space-y-6">
        <section aria-labelledby="consumable-identification" className="space-y-4">
          <h3 id="consumable-identification" className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Identificação do artigo
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <FormField id="consumable-name" label="Nome do artigo" required error={errors.name}>
                {(field) => <input {...field} name="name" autoFocus value={form.name} onChange={handleChange} className={inputClass('name')} />}
              </FormField>
            </div>

            <FormField
              id="consumable-category"
              label="Categoria"
              required
              error={errors.category}
              hint={!isCreate ? 'Mudar a categoria não altera o SKU já atribuído.' : undefined}
            >
              {(field) => (
                <select {...field} name="category" value={form.category} onChange={handleChange} className={inputClass('category')}>
                  <option value="">— Escolha —</option>
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
            </FormField>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">SKU</p>
              <p className="mt-1 font-mono text-sm font-medium text-slate-800">
                {isCreate ? (prefix ? `${prefix}-#### (número atribuído ao gravar)` : 'Escolha a categoria') : consumable.sku || '—'}
              </p>
            </div>

            <FormField id="consumable-unit" label="Unidade" required error={errors.unit}>
              {(field) => (
                <select {...field} name="unit" value={form.unit} onChange={handleChange} className={inputClass('unit')}>
                  {UNIT_OPTIONS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              )}
            </FormField>

            <FormField id="consumable-supplier" label="Fornecedor" required error={errors.supplier}>
              {(field) => <input {...field} name="supplier" value={form.supplier} onChange={handleChange} className={inputClass('supplier')} />}
            </FormField>

            <div className="md:col-span-2">
              <FormField id="consumable-description" label="Descrição técnica e instruções" required error={errors.description}>
                {(field) => (
                  <textarea {...field} name="description" rows={3} value={form.description} onChange={handleChange} className={inputClass('description')} />
                )}
              </FormField>
            </div>
          </div>
        </section>

        <section aria-labelledby="consumable-stock" className="space-y-4">
          <h3 id="consumable-stock" className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Preço e stock
          </h3>
          <div className="grid gap-4 md:grid-cols-3">
            <FormField id="consumable-price" label="Preço unitário (€)" required error={errors.unit_price}>
              {(field) => (
                <input
                  {...field}
                  name="unit_price"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={form.unit_price}
                  onChange={handleChange}
                  className={inputClass('unit_price')}
                />
              )}
            </FormField>
            <FormField id="consumable-min-stock" label={`Stock mínimo (${form.unit})`} required error={errors.min_stock} hint="Abaixo disto o artigo fica em 'Stock baixo'.">
              {(field) => (
                <input
                  {...field}
                  name="min_stock"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1"
                  value={form.min_stock}
                  onChange={handleChange}
                  className={inputClass('min_stock')}
                />
              )}
            </FormField>
            {isCreate ? (
              <FormField id="consumable-stock-quantity" label={`Stock físico inicial (${form.unit})`} required error={errors.stock_quantity}>
                {(field) => (
                  <input
                    {...field}
                    name="stock_quantity"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="1"
                    value={form.stock_quantity}
                    onChange={handleChange}
                    className={inputClass('stock_quantity')}
                  />
                )}
              </FormField>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                O stock físico altera-se com <strong>Ajustar stock</strong> (entradas e saídas).
              </div>
            )}
          </div>
        </section>

        {Object.keys(errors).some((key) => errors[key]) && (
          <p className="text-sm text-red-600" role="alert">
            Preenchimento obrigatório: corrija os campos assinalados antes de guardar.
          </p>
        )}
        <ErrorAlert message={serverError} onClose={onDismissError} />

        <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
          <button type="button" onClick={onClose} disabled={saving} className={SECONDARY_BUTTON}>
            Cancelar
          </button>
          <button type="submit" disabled={saving} className={PRIMARY_BUTTON}>
            {saving ? 'A guardar...' : isCreate ? 'Criar artigo' : 'Guardar alterações'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
