import { useEffect, useState } from 'react'
import { SERVICE_TYPES } from '../utils/labels'
import {
  createChecklistStep,
  toNewServicePayload,
  toServiceForm,
  toServicePayload,
  validateServiceForm,
} from '../utils/serviceForm'
import BaseConsumablesEditor from './BaseConsumablesEditor'
import ChecklistEditor from './ChecklistEditor'
import FormField, { inputClass } from './FormField'

const SAVE_ERROR = 'Não foi possível guardar o serviço. Verifique a ligação e tente novamente.'

/**
 * Formulário de criação/edição de serviço. A página remonta-o com `key` ao trocar de serviço,
 * por isso o estado inicial vem só de `service` (sem efeitos a copiar props).
 * Os consumíveis chegam por props a partir do hook da página.
 */
export default function ServiceFormModal({ service, consumableOptions, onClose, onSave }) {
  const [form, setForm] = useState(() => toServiceForm(service))
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [focusStepId, setFocusStepId] = useState(null)

  // Escape fecha o formulário, exceto durante a gravação (para não perder o pedido a meio).
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape' && !saving) onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    // Limpeza: retira o listener quando o formulário fecha.
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose, saving])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  // --- Checklist (atualizações imutáveis) ---
  function addStep() {
    const step = createChecklistStep()
    setForm((previous) => ({ ...previous, checklist_template: [...previous.checklist_template, step] }))
    setFocusStepId(step.id)
  }

  function changeStep(stepId, text) {
    setForm((previous) => ({
      ...previous,
      checklist_template: previous.checklist_template.map((step) => (step.id === stepId ? { ...step, text } : step)),
    }))
  }

  function moveStep(stepId, direction) {
    setForm((previous) => {
      const steps = previous.checklist_template
      const from = steps.findIndex((step) => step.id === stepId)
      const to = from + direction
      if (from < 0 || to < 0 || to >= steps.length) return previous
      // Troca as duas posições num array novo, sem mutar o estado anterior.
      const reordered = steps.map((step, index) => {
        if (index === from) return steps[to]
        if (index === to) return steps[from]
        return step
      })
      return { ...previous, checklist_template: reordered }
    })
  }

  function removeStep(stepId) {
    setForm((previous) => ({
      ...previous,
      checklist_template: previous.checklist_template.filter((step) => step.id !== stepId),
    }))
  }

  // --- Produtos obrigatórios ---
  function addConsumable(consumableId) {
    setForm((previous) => {
      if (previous.base_consumables.some((item) => item.consumable_id === consumableId)) return previous
      return { ...previous, base_consumables: [...previous.base_consumables, { consumable_id: consumableId, quantity: '1' }] }
    })
  }

  function changeConsumableQuantity(consumableId, quantity) {
    setForm((previous) => ({
      ...previous,
      base_consumables: previous.base_consumables.map((item) => (
        item.consumable_id === consumableId ? { ...item, quantity } : item
      )),
    }))
  }

  // Troca um consumível em rutura pela alternativa proposta, mantendo a quantidade e a posição.
  function replaceConsumable(consumableId, alternativeId) {
    setForm((previous) => {
      if (previous.base_consumables.some((item) => item.consumable_id === alternativeId)) return previous
      return {
        ...previous,
        base_consumables: previous.base_consumables.map((item) => (
          item.consumable_id === consumableId ? { ...item, consumable_id: alternativeId } : item
        )),
      }
    })
    // O erro de quantidade estava associado ao id antigo; volta a ser validado ao guardar.
    setErrors((previous) => {
      const next = { ...previous }
      delete next[`base_consumables.${consumableId}`]
      return next
    })
  }

  function removeConsumable(consumableId) {
    setForm((previous) => ({
      ...previous,
      base_consumables: previous.base_consumables.filter((item) => item.consumable_id !== consumableId),
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaveError('')
    const validationErrors = validateServiceForm(form)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) {
      setSaveError('Corrija os campos assinalados antes de guardar.')
      return
    }
    setSaving(true)
    try {
      const payload = service ? toServicePayload(form) : toNewServicePayload(form)
      const saved = await onSave(service?.id ?? null, payload)
      if (saved) {
        onClose()
        return
      }
      // Em caso de falha os dados preenchidos mantêm-se (RNF-GLB03).
      setSaveError(SAVE_ERROR)
    } catch {
      setSaveError(SAVE_ERROR)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose()
      }}
    >
      <section role="dialog" aria-modal="true" aria-labelledby="service-form-title" className="my-8 w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Catálogo de serviços</p>
            <h2 id="service-form-title" className="mt-1 text-xl font-bold text-slate-900">
              {service ? `Editar serviço: ${service.name}` : 'Novo tipo de intervenção'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Fechar"
            className="rounded-lg px-2 py-1 text-xl leading-none text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            ×
          </button>
        </div>

        <form noValidate onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
          <FormField id="service-name" label="Nome do serviço" required error={errors.name}>
            {(fieldProps) => (
              <input {...fieldProps} className={inputClass} name="name" value={form.name} onChange={handleChange} placeholder="Ex.: Manutenção preventiva quinzenal" autoFocus disabled={saving} />
            )}
          </FormField>

          <div className="grid gap-4 sm:grid-cols-3">
            <FormField id="service-type" label="Tipo de serviço" required error={errors.type}>
              {(fieldProps) => (
                <select {...fieldProps} className={inputClass} name="type" value={form.type} onChange={handleChange} disabled={saving}>
                  {SERVICE_TYPES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              )}
            </FormField>
            <FormField id="service-duration" label="Duração padrão (minutos)" required error={errors.default_duration_min}>
              {(fieldProps) => (
                <input {...fieldProps} className={inputClass} type="number" min="1" step="1" inputMode="numeric" name="default_duration_min" value={form.default_duration_min} onChange={handleChange} disabled={saving} />
              )}
            </FormField>
            <FormField id="service-price" label="Preço base com IVA (€)" required error={errors.base_price}>
              {(fieldProps) => (
                <input {...fieldProps} className={inputClass} type="number" min="0" step="0.01" inputMode="decimal" name="base_price" value={form.base_price} onChange={handleChange} disabled={saving} />
              )}
            </FormField>
          </div>

          <FormField id="service-description" label="Descrição" error={errors.description}>
            {(fieldProps) => (
              <textarea {...fieldProps} className={`${inputClass} min-h-20 resize-y`} name="description" value={form.description} onChange={handleChange} rows="2" disabled={saving} />
            )}
          </FormField>

          <ChecklistEditor
            steps={form.checklist_template}
            errors={errors}
            focusStepId={focusStepId}
            disabled={saving}
            onAdd={addStep}
            onChange={changeStep}
            onMove={moveStep}
            onRemove={removeStep}
          />

          <BaseConsumablesEditor
            items={form.base_consumables}
            consumables={consumableOptions.consumables}
            notFoundIds={consumableOptions.notFoundIds}
            hasMore={consumableOptions.hasMore}
            loading={consumableOptions.loading}
            loadError={consumableOptions.error}
            errors={errors}
            disabled={saving}
            onAdd={addConsumable}
            onQuantityChange={changeConsumableQuantity}
            onReplace={replaceConsumable}
            onRemove={removeConsumable}
            onLoadMore={consumableOptions.loadMore}
          />

          {saveError && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{saveError}</p>}

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
            <button type="button" onClick={onClose} disabled={saving} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-60">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60">
              {saving ? 'A guardar…' : 'Guardar serviço'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
