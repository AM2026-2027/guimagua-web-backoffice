import { useState } from 'react'
import ErrorAlert from '../../../shared/components/ErrorAlert'
import FormField from '../../../shared/components/FormField'
import Modal from '../../../shared/components/Modal'
import { INPUT_CLASS, INPUT_ERROR_CLASS, PRIMARY_BUTTON, SECONDARY_BUTTON } from '../../../shared/components/uiClasses'
import { thresholdToFormState, thresholdToPayload } from '../utils/thresholdForm'
import { CHLORINE_RANGE, PH_RANGE, TEMPERATURE_RANGE, validateAlertThresholds } from '../utils/thresholdValidation'

const THRESHOLD_GROUPS = [
  {
    legend: `pH (válido ${PH_RANGE.min} – ${PH_RANGE.max})`,
    step: '0.1',
    bounds: PH_RANGE,
    min: { id: 'threshold-ph-min', name: 'ph_min', label: 'pH mínimo' },
    max: { id: 'threshold-ph-max', name: 'ph_max', label: 'pH máximo' },
  },
  {
    legend: `Cloro livre em ppm (válido ${CHLORINE_RANGE.min} – ${CHLORINE_RANGE.max})`,
    step: '0.1',
    bounds: CHLORINE_RANGE,
    min: { id: 'threshold-chlorine-min', name: 'chlorine_min_ppm', label: 'Cloro mínimo (ppm)' },
    max: { id: 'threshold-chlorine-max', name: 'chlorine_max_ppm', label: 'Cloro máximo (ppm)' },
  },
  {
    legend: `Temperatura em °C (válido ${TEMPERATURE_RANGE.min} – ${TEMPERATURE_RANGE.max})`,
    step: '0.5',
    bounds: TEMPERATURE_RANGE,
    min: { id: 'threshold-temp-min', name: 'temperature_min_c', label: 'Temperatura mínima (°C)' },
    max: { id: 'threshold-temp-max', name: 'temperature_max_c', label: 'Temperatura máxima (°C)' },
  },
]

/**
 * Modal de parametrização dos limiares de alerta (`settings/alert_thresholds`, D-11 / RF-WEB05).
 * O formulário reinicia via `key` na página, mantendo os dados em caso de erro (RNF-GLB03).
 */
export default function AlertThresholdsModal({ thresholds, serverError, onDismissError, onSubmit, onClose }) {
  const [form, setForm] = useState(() => thresholdToFormState(thresholds))
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const validation = validateAlertThresholds(form)
    setErrors(validation)
    if (Object.keys(validation).length > 0) return

    setSaving(true)
    try {
      await onSubmit(thresholdToPayload(form))
    } finally {
      setSaving(false)
    }
  }

  const inputClass = (name) => `${INPUT_CLASS} ${errors[name] ? INPUT_ERROR_CLASS : ''}`

  return (
    <Modal
      title="Limiares de alerta das piscinas"
      description="Defina os intervalos ideais de referência. Leituras fora destes valores geram alertas no dashboard e na App Cliente."
      onClose={saving ? () => {} : onClose}
    >
      <form noValidate onSubmit={handleSubmit} className="space-y-5">
        {THRESHOLD_GROUPS.map((group) => (
          <fieldset key={group.legend} className="space-y-3 rounded-xl border border-slate-200 p-4">
            <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-primary">{group.legend}</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              {[group.min, group.max].map((fieldConfig) => (
                <FormField
                  key={fieldConfig.name}
                  id={fieldConfig.id}
                  label={fieldConfig.label}
                  required
                  error={errors[fieldConfig.name]}
                >
                  {(field) => (
                    <input
                      {...field}
                      name={fieldConfig.name}
                      type="number"
                      step={group.step}
                      min={group.bounds.min}
                      max={group.bounds.max}
                      value={form[fieldConfig.name]}
                      onChange={handleChange}
                      className={inputClass(fieldConfig.name)}
                    />
                  )}
                </FormField>
              ))}
            </div>
          </fieldset>
        ))}

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
            {saving ? 'A guardar...' : 'Guardar limiares'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
