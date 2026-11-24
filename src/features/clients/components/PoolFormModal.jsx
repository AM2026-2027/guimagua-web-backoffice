import { useState } from 'react'
import ErrorAlert from '../../../shared/components/ErrorAlert'
import Modal from '../../../shared/components/Modal'
import FormField from '../../../shared/components/FormField'
import { INPUT_CLASS, INPUT_ERROR_CLASS, PRIMARY_BUTTON, SECONDARY_BUTTON } from '../../../shared/components/uiClasses'
import { poolToFormState, poolToPayload } from '../utils/poolForm'
import { formatMaxVolume, maxVolumeFromDimensions, validatePool } from '../utils/poolValidation'
import { EQUIPMENT_SUGGESTIONS, POOL_TYPE_OPTIONS, TREATMENT_TYPE_OPTIONS } from '../utils/labels'

/**
 * Criar/editar piscina (US02). Reiniciado pela `key` dada pela página.
 * Os equipamentos são uma lista de descrições (`pools.equipment`): sugestões + texto livre.
 */
export default function PoolFormModal({ pool, defaultAddress, serverError, onDismissError, onSubmit, onClose }) {
  const [form, setForm] = useState(() => poolToFormState(pool, defaultAddress))
  const [errors, setErrors] = useState({})
  const [customEquipment, setCustomEquipment] = useState('')
  const [saving, setSaving] = useState(false)

  const isEdit = Boolean(pool)
  const customItems = form.equipment.filter((item) => !EQUIPMENT_SUGGESTIONS.includes(item))
  // Derivado: volume máximo permitido pelas dimensões escritas (mostrado como ajuda no campo do volume).
  const maxVolume = maxVolumeFromDimensions(form.dimensions)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  function toggleEquipment(item) {
    setForm((prev) => ({
      ...prev,
      equipment: prev.equipment.includes(item)
        ? prev.equipment.filter((value) => value !== item)
        : [...prev.equipment, item],
    }))
  }

  function addCustomEquipment() {
    const item = customEquipment.trim()
    if (!item) return
    setForm((prev) => (prev.equipment.includes(item) ? prev : { ...prev, equipment: [...prev.equipment, item] }))
    setCustomEquipment('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const validation = validatePool(form)
    setErrors(validation)
    if (Object.keys(validation).length > 0) return

    setSaving(true)
    try {
      await onSubmit(poolToPayload(form))
    } finally {
      setSaving(false)
    }
  }

  const inputClass = (name) => `${INPUT_CLASS} ${errors[name] ? INPUT_ERROR_CLASS : ''}`

  return (
    <Modal title={isEdit ? 'Editar piscina' : 'Nova piscina'} onClose={saving ? () => {} : onClose} size="lg">
      <form noValidate onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField id="pool-name" label="Nome da piscina" optional hint='Ex.: "Piscina exterior". Aparece no seletor da App Cliente.'>
            {(field) => (
              <input {...field} name="name" autoFocus value={form.name} onChange={handleChange} className={inputClass('name')} />
            )}
          </FormField>

          <FormField id="pool-type" label="Tipo de piscina" required error={errors.pool_type}>
            {(field) => (
              <select {...field} name="pool_type" value={form.pool_type} onChange={handleChange} className={inputClass('pool_type')}>
                {POOL_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          </FormField>

          <div className="md:col-span-2">
            <FormField id="pool-address" label="Morada da instalação" required error={errors.local_address}>
              {(field) => (
                <input
                  {...field}
                  name="local_address"
                  value={form.local_address}
                  onChange={handleChange}
                  className={inputClass('local_address')}
                />
              )}
            </FormField>
          </div>

          <FormField
            id="pool-dimensions"
            label="Dimensões (m)"
            required
            error={errors.dimensions}
            hint="Comprimento x largura x altura (profundidade máxima), ex.: 12x5x1.8"
          >
            {(field) => (
              <input
                {...field}
                name="dimensions"
                placeholder="12x5x1.8"
                value={form.dimensions}
                onChange={handleChange}
                className={inputClass('dimensions')}
              />
            )}
          </FormField>

          <FormField
            id="pool-volume"
            label="Volume de água (m³)"
            required
            error={errors.volume_m3}
            hint={maxVolume != null ? `Máximo pelas dimensões: ${formatMaxVolume(maxVolume)} m³` : undefined}
          >
            {(field) => (
              <input
                {...field}
                name="volume_m3"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.1"
                value={form.volume_m3}
                onChange={handleChange}
                className={inputClass('volume_m3')}
              />
            )}
          </FormField>

          <FormField id="pool-treatment" label="Tipo de tratamento" required error={errors.treatment_type}>
            {(field) => (
              <select
                {...field}
                name="treatment_type"
                value={form.treatment_type}
                onChange={handleChange}
                className={inputClass('treatment_type')}
              >
                <option value="">— Escolha —</option>
                {TREATMENT_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          </FormField>
        </div>

        <fieldset className="rounded-xl border border-slate-200 p-4">
          <legend className="px-1 text-sm font-medium text-slate-700">Equipamentos instalados</legend>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {EQUIPMENT_SUGGESTIONS.map((item) => (
              <label key={item} className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.equipment.includes(item)}
                  onChange={() => toggleEquipment(item)}
                  className="h-4 w-4 rounded border-slate-300 accent-primary"
                />
                {item}
              </label>
            ))}
          </div>

          {customItems.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2" aria-label="Outros equipamentos">
              {customItems.map((item) => (
                <li key={item} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                  {item}
                  <button
                    type="button"
                    onClick={() => toggleEquipment(item)}
                    aria-label={`Remover ${item}`}
                    className="ml-1 font-bold text-slate-500 hover:text-slate-800"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-3 flex gap-2">
            <label htmlFor="pool-custom-equipment" className="sr-only">
              Outro equipamento
            </label>
            <input
              id="pool-custom-equipment"
              placeholder="Outro equipamento (ex.: Hayward TriStar 2CV)"
              value={customEquipment}
              onChange={(event) => setCustomEquipment(event.target.value)}
              onKeyDown={(event) => {
                // Enter acrescenta o equipamento em vez de submeter o formulário.
                if (event.key === 'Enter') {
                  event.preventDefault()
                  addCustomEquipment()
                }
              }}
              className={INPUT_CLASS}
            />
            <button type="button" onClick={addCustomEquipment} className={`${SECONDARY_BUTTON} mt-1`}>
              Adicionar
            </button>
          </div>
        </fieldset>

        <FormField id="pool-notes" label="Notas técnicas" optional>
          {(field) => (
            <textarea {...field} name="notes" rows={3} value={form.notes} onChange={handleChange} className={inputClass('notes')} />
          )}
        </FormField>

        {Object.keys(errors).some((key) => errors[key]) && (
          <p className="text-sm text-red-600" role="alert">
            Indique dimensões e volume de água válidos e corrija os restantes campos assinalados.
          </p>
        )}
        <ErrorAlert message={serverError} onClose={onDismissError} />

        <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
          <button type="button" onClick={onClose} disabled={saving} className={SECONDARY_BUTTON}>
            Cancelar
          </button>
          <button type="submit" disabled={saving} className={PRIMARY_BUTTON}>
            {saving ? 'A guardar...' : isEdit ? 'Guardar piscina' : 'Adicionar piscina'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
