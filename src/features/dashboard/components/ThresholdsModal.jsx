import { useState } from 'react'
import ErrorAlert from '../../../shared/components/ErrorAlert'
import FormField from '../../../shared/components/FormField'
import Modal from '../../../shared/components/Modal'
import {
  INPUT_CLASS,
  INPUT_ERROR_CLASS,
  PRIMARY_BUTTON,
  SECONDARY_BUTTON,
} from '../../../shared/components/uiClasses'
import { formatLisbonDateTime } from '../utils/labels'
import { THRESHOLD_LIMITS, toThresholdsFormState, validateThresholdsForm } from '../utils/thresholds'

export default function ThresholdsModal({ thresholds, saving, serverError, onClose, onSave }) {
  const [form, setForm] = useState(() => toThresholdsFormState(thresholds))
  const [errors, setErrors] = useState({})

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => {
      if (!prev[name]) return prev
      const next = { ...prev }
      delete next[name]
      return next
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const result = validateThresholdsForm(form)
    if (Object.keys(result.errors).length > 0) {
      setErrors(result.errors)
      return
    }
    setErrors({})
    await onSave(result.payload)
  }

  const inputClass = (fieldName) =>
    `${INPUT_CLASS} ${errors[fieldName] ? INPUT_ERROR_CLASS : ''}`

  return (
    <Modal
      title="Parametrizar limiares de alerta"
      description="Defina os intervalos seguros para as leituras físico-químicas (RF-WEB05, D-11). Os valores são partilhados com a App Cliente."
      onClose={saving ? () => {} : onClose}
      size="md"
    >
      <form noValidate onSubmit={handleSubmit} className="space-y-5">
        <ErrorAlert message={serverError} />

        <fieldset className="space-y-3 rounded-xl border border-slate-200 p-4">
          <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-primary">
            pH (intervalo válido {THRESHOLD_LIMITS.ph.min}–{THRESHOLD_LIMITS.ph.max})
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="threshold-ph-min" label="pH mínimo" required error={errors.ph_min}>
              {(fieldProps) => (
                <input
                  {...fieldProps}
                  name="ph_min"
                  type="number"
                  step="0.1"
                  value={form.ph_min}
                  onChange={handleChange}
                  disabled={saving}
                  className={inputClass('ph_min')}
                />
              )}
            </FormField>
            <FormField id="threshold-ph-max" label="pH máximo" required error={errors.ph_max}>
              {(fieldProps) => (
                <input
                  {...fieldProps}
                  name="ph_max"
                  type="number"
                  step="0.1"
                  value={form.ph_max}
                  onChange={handleChange}
                  disabled={saving}
                  className={inputClass('ph_max')}
                />
              )}
            </FormField>
          </div>
        </fieldset>

        <fieldset className="space-y-3 rounded-xl border border-slate-200 p-4">
          <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-primary">
            Cloro livre (intervalo válido {THRESHOLD_LIMITS.chlorine.min}–{THRESHOLD_LIMITS.chlorine.max} ppm)
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="threshold-cl-min" label="Cloro mínimo (ppm)" required error={errors.chlorine_min_ppm}>
              {(fieldProps) => (
                <input
                  {...fieldProps}
                  name="chlorine_min_ppm"
                  type="number"
                  step="0.1"
                  value={form.chlorine_min_ppm}
                  onChange={handleChange}
                  disabled={saving}
                  className={inputClass('chlorine_min_ppm')}
                />
              )}
            </FormField>
            <FormField id="threshold-cl-max" label="Cloro máximo (ppm)" required error={errors.chlorine_max_ppm}>
              {(fieldProps) => (
                <input
                  {...fieldProps}
                  name="chlorine_max_ppm"
                  type="number"
                  step="0.1"
                  value={form.chlorine_max_ppm}
                  onChange={handleChange}
                  disabled={saving}
                  className={inputClass('chlorine_max_ppm')}
                />
              )}
            </FormField>
          </div>
        </fieldset>

        <fieldset className="space-y-3 rounded-xl border border-slate-200 p-4">
          <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-primary">
            Temperatura (intervalo válido {THRESHOLD_LIMITS.temperature.min}–{THRESHOLD_LIMITS.temperature.max} °C)
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="threshold-temp-min" label="Temperatura mínima (°C)" required error={errors.temperature_min_c}>
              {(fieldProps) => (
                <input
                  {...fieldProps}
                  name="temperature_min_c"
                  type="number"
                  step="0.5"
                  value={form.temperature_min_c}
                  onChange={handleChange}
                  disabled={saving}
                  className={inputClass('temperature_min_c')}
                />
              )}
            </FormField>
            <FormField id="threshold-temp-max" label="Temperatura máxima (°C)" required error={errors.temperature_max_c}>
              {(fieldProps) => (
                <input
                  {...fieldProps}
                  name="temperature_max_c"
                  type="number"
                  step="0.5"
                  value={form.temperature_max_c}
                  onChange={handleChange}
                  disabled={saving}
                  className={inputClass('temperature_max_c')}
                />
              )}
            </FormField>
          </div>
        </fieldset>

        {thresholds?.updated_at && (
          <p className="text-xs text-slate-500">
            Última atualização: {formatLisbonDateTime(thresholds.updated_at)}
          </p>
        )}

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button type="button" onClick={onClose} disabled={saving} className={SECONDARY_BUTTON}>
            Cancelar
          </button>
          <button type="submit" disabled={saving} className={PRIMARY_BUTTON}>
            {saving ? 'A guardar…' : 'Guardar limiares'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
