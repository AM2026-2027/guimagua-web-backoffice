import { useState } from 'react'
import ErrorAlert from '../../../shared/components/ErrorAlert'
import Modal from '../../../shared/components/Modal'
import FormField from '../../../shared/components/FormField'
import {
  INPUT_CLASS,
  INPUT_ERROR_CLASS,
  PRIMARY_BUTTON,
  SECONDARY_BUTTON,
} from '../../../shared/components/uiClasses'
import { ROLES } from '../../../constants/roles'
import { SPECIALTY_OPTIONS, STAFF_ROLE_OPTIONS, formatDate, roleLabel } from '../utils/labels'
import { staffToFormState, staffToPayload } from '../utils/staffForm'
import { validateStaff } from '../utils/staffValidation'
import { staffEmailFor, suggestUsername } from '../utils/username'

/**
 * Criar/editar colaborador (protótipo modal-ficha-tecnico). Reiniciado pela `key` dada pela página.
 * - Na criação, a conta é criada no Firebase Auth com uma palavra-passe temporária, mostrada uma única vez
 *   ao admin; a App obriga a escolher uma nova no primeiro início de sessão.
 * - Na edição, o email fica só de leitura e mudar o perfil de acesso exige confirmação explícita.
 * - `isSelf`: o admin autenticado não pode alterar o próprio perfil de acesso.
 * - Na criação, o nome de utilizador é gerado a partir do nome (único face a `takenUsernames`) e o email da
 *   conta é derivado dele com a base `emailBase` (D-16).
 * - `pending`: conta já criada no Auth sem perfil gravado; o username e o email ficam fixos e só se repete a gravação.
 */
export default function StaffFormModal({
  user,
  isSelf,
  pending,
  takenUsernames,
  emailBase,
  serverError,
  onDismissError,
  onSubmit,
  onClose,
}) {
  const [form, setForm] = useState(() => staffToFormState(user))
  const [errors, setErrors] = useState({})
  const [roleChangeConfirmed, setRoleChangeConfirmed] = useState(false)
  const [saving, setSaving] = useState(false)

  const isCreate = !user
  const roleChanged = !isCreate && form.role !== user.role
  const selectedCount = form.specialties.length
  // Derivado na renderização: username sugerido e email da conta (só na criação).
  const username = isCreate ? (pending?.username ?? suggestUsername(form.name, takenUsernames)) : null
  const email = isCreate ? (pending?.email ?? staffEmailFor(username, emailBase)) : null

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
    if (name === 'role') setRoleChangeConfirmed(false)
  }

  function toggleSpecialty(value) {
    setForm((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(value)
        ? prev.specialties.filter((item) => item !== value)
        : [...prev.specialties, value],
    }))
    if (errors.specialties) setErrors((prev) => ({ ...prev, specialties: undefined }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const validation = validateStaff(form, { isCreate, username, email, emailBase })
    if (roleChanged && !roleChangeConfirmed) {
      validation.roleConfirmation = 'Confirme a alteração do perfil de acesso.'
    }
    setErrors(validation)
    if (Object.keys(validation).length > 0) return

    setSaving(true)
    try {
      await onSubmit(staffToPayload(form, { isCreate, username, email }))
    } finally {
      setSaving(false)
    }
  }

  const inputClass = (name) => `${INPUT_CLASS} ${errors[name] ? INPUT_ERROR_CLASS : ''}`
  const title = isCreate ? (pending ? 'Concluir registo do colaborador' : 'Novo colaborador') : `Ficha de ${user.name}`

  return (
    <Modal
      title={title}
      description={
        isCreate
          ? 'A conta é criada no Firebase Authentication com uma palavra-passe temporária, mostrada uma única vez, para passar ao colaborador. No primeiro início de sessão, a App obriga-o a escolher uma nova.'
          : `${roleLabel(user.role)} · ${user.username || user.email}`
      }
      onClose={saving ? () => {} : onClose}
      size="lg"
    >
      <form noValidate onSubmit={handleSubmit} className="space-y-6">
        <section aria-labelledby="staff-general" className="space-y-4">
          <h3 id="staff-general" className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Dados gerais e contacto
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <FormField id="staff-name" label="Nome completo" required error={errors.name}>
                {(field) => (
                  <input {...field} name="name" autoFocus autoComplete="name" value={form.name} onChange={handleChange} className={inputClass('name')} />
                )}
              </FormField>
            </div>

            {isCreate ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 md:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Acesso à App Guimágua</p>
                <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-slate-500">Nome de utilizador (gerado a partir do nome)</dt>
                    <dd className="font-mono font-medium text-slate-800">{username || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Email da conta (recebe o link de reposição)</dt>
                    <dd className="break-all font-mono text-slate-700">{email || '—'}</dd>
                  </div>
                </dl>
                {errors.username && (
                  <p role="alert" className="mt-2 text-xs text-red-600">
                    {errors.username}
                  </p>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 md:col-span-2">
                <p className="text-sm text-slate-600">
                  Nome de utilizador: <span className="font-mono font-medium text-slate-800">{user.username || '—'}</span>
                  <span className="block text-xs text-slate-500">
                    O nome de utilizador e o email da conta ({user.email}) não podem ser alterados.
                  </span>
                </p>
              </div>
            )}

            <FormField id="staff-phone" label="Telemóvel" required error={errors.phone}>
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

            <FormField
              id="staff-role"
              label="Perfil de acesso"
              required
              error={errors.role}
              hint={isSelf ? 'Não pode alterar o seu próprio perfil de acesso.' : undefined}
            >
              {(field) => (
                <select {...field} name="role" disabled={isSelf} value={form.role} onChange={handleChange} className={inputClass('role')}>
                  {STAFF_ROLE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
            </FormField>
          </div>

          {roleChanged && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <label className="flex items-start gap-3 text-sm text-amber-900">
                <input
                  type="checkbox"
                  checked={roleChangeConfirmed}
                  onChange={(event) => setRoleChangeConfirmed(event.target.checked)}
                  aria-describedby={errors.roleConfirmation ? 'staff-role-confirmation-error' : undefined}
                  className="mt-0.5 h-4 w-4 rounded border-amber-300 accent-primary"
                />
                <span>
                  Confirmo a alteração do perfil de acesso de <strong>{roleLabel(user.role)}</strong> para{' '}
                  <strong>{roleLabel(form.role)}</strong>.
                </span>
              </label>
              {errors.roleConfirmation && (
                <p id="staff-role-confirmation-error" className="mt-2 text-xs text-red-600">
                  {errors.roleConfirmation}
                </p>
              )}
            </div>
          )}
        </section>

        <fieldset className="space-y-3" aria-describedby={errors.specialties ? 'staff-specialties-error' : undefined}>
          <legend className="flex w-full flex-wrap items-baseline justify-between gap-2">
            <span className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Especialidades técnicas
              {form.role === ROLES.TECHNICIAN && (
                <span className="text-red-600" aria-hidden="true">
                  {' '}
                  *
                </span>
              )}
            </span>
            <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-primary">
              {selectedCount} de {SPECIALTY_OPTIONS.length} selecionadas
            </span>
          </legend>
          <div className="grid gap-3 md:grid-cols-2">
            {SPECIALTY_OPTIONS.map((option) => {
              const checked = form.specialties.includes(option.value)
              return (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm focus-within:ring-2 focus-within:ring-primary/40 ${
                    checked ? 'border-primary/40 bg-primary/5' : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleSpecialty(option.value)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-primary"
                  />
                  <span>
                    <span className="block font-medium text-slate-800">{option.label}</span>
                    <span className="block text-xs text-slate-500">{option.description}</span>
                  </span>
                </label>
              )
            })}
          </div>
          {errors.specialties && (
            <p id="staff-specialties-error" className="text-xs text-red-600">
              {errors.specialties}
            </p>
          )}
        </fieldset>

        {Object.keys(errors).some((key) => errors[key]) && (
          <p className="text-sm text-red-600" role="alert">
            Corrija os campos assinalados antes de guardar.
          </p>
        )}
        <ErrorAlert message={serverError} onClose={onDismissError} />

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-400">{isCreate ? '' : `Última alteração: ${formatDate(user.updated_at)}`}</p>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} disabled={saving} className={SECONDARY_BUTTON}>
              Cancelar
            </button>
            <button type="submit" disabled={saving} className={PRIMARY_BUTTON}>
              {saving
                ? 'A guardar...'
                : isCreate
                  ? pending
                    ? 'Concluir registo'
                    : 'Criar conta'
                  : 'Guardar alterações'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
