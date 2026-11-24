import { useState } from 'react'
import {
  SERVICE_CATEGORIES,
  toServiceForm,
  toServicePayload,
  validateServiceForm,
} from '../utils/serviceForm'

function Field({ label, error, children }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      <span>{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  )
}

const inputClass = 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15'

export default function ServiceFormModal({ service, onClose, onSave }) {
  const [form, setForm] = useState(() => toServiceForm(service))
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  function handleChange(event) {
    const { name, value, type, checked } = event.target
    setForm((previous) => ({ ...previous, [name]: type === 'checkbox' ? checked : value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const validationErrors = validateServiceForm(form)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return
    setSaving(true)
    try {
      const saved = await onSave(service?.id ?? null, toServicePayload(form))
      if (saved) onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section role="dialog" aria-modal="true" aria-labelledby="service-form-title" className="my-8 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Catálogo de serviços</p>
            <h2 id="service-form-title" className="mt-1 text-xl font-bold text-slate-900">{service ? 'Editar serviço' : 'Novo tipo de intervenção'}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar" className="rounded-lg px-2 py-1 text-xl text-slate-500 hover:bg-slate-100">×</button>
        </div>
        <form noValidate onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Código" error={errors.code}><input className={inputClass} name="code" value={form.code} onChange={handleChange} placeholder="INT-001" /></Field>
            <Field label="Categoria" error={errors.category}>
              <select className={inputClass} name="category" value={form.category} onChange={handleChange}>
                {SERVICE_CATEGORIES.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Nome do serviço" error={errors.name}><input className={inputClass} name="name" value={form.name} onChange={handleChange} placeholder="Ex.: Manutenção preventiva quinzenal" /></Field>
          <Field label="Descrição"><textarea className={`${inputClass} min-h-20 resize-y`} name="description" value={form.description} onChange={handleChange} rows="2" /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Duração estimada (minutos)" error={errors.estimated_duration_minutes}><input className={inputClass} type="number" min="1" step="1" name="estimated_duration_minutes" value={form.estimated_duration_minutes} onChange={handleChange} /></Field>
            <Field label="Preço base (€)" error={errors.base_price}><input className={inputClass} type="number" min="0" step="0.01" name="base_price" value={form.base_price} onChange={handleChange} /></Field>
          </div>
          <Field label="Químicos / peças incluídos"><input className={inputClass} name="included_items" value={form.included_items} onChange={handleChange} placeholder="Ex.: Incluído no plano" /></Field>
          <div className="grid gap-3 pt-1 sm:grid-cols-3">
            {[
              ['is_active', 'Serviço ativo'],
              ['vat_included', 'Preço inclui IVA'],
              ['is_iot_enabled', 'Elegível para IoT'],
            ].map(([name, label]) => (
              <label key={name} className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" name={name} checked={form[name]} onChange={handleChange} className="h-4 w-4 accent-primary" />{label}
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button type="button" onClick={onClose} disabled={saving} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancelar</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:cursor-wait disabled:opacity-60">{saving ? 'A guardar…' : 'Guardar serviço'}</button>
          </div>
        </form>
      </section>
    </div>
  )
}
