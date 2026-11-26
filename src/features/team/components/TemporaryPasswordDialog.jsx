import { useState } from 'react'
import Modal from '../../../shared/components/Modal'
import { PRIMARY_BUTTON, SECONDARY_BUTTON } from '../../../shared/components/uiClasses'

/**
 * Mostra UMA vez a palavra-passe temporária de uma conta nova. Ao fechar, a página apaga-a da memória.
 * No primeiro início de sessão, a App obriga o colaborador a escolher uma nova (`must_change_password`).
 */
export default function TemporaryPasswordDialog({ name, username, email, password, onClose }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(password)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Modal title="Conta criada" description={`${name} · ${email}`} onClose={onClose} size="sm">
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Passe estes dados ao colaborador. No primeiro início de sessão, a App vai pedir-lhe que escolha uma palavra-passe nova.
        </p>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Nome de utilizador</p>
          <p className="mt-2 select-all font-mono text-xl font-semibold text-slate-800">{username}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Palavra-passe temporária</p>
          <p className="mt-2 select-all font-mono text-2xl font-semibold tracking-wider text-slate-800" aria-label={`Palavra-passe temporária: ${password.split('').join(' ')}`}>
            {password}
          </p>
        </div>
        <p role="alert" className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Esta palavra-passe só é mostrada agora: não fica guardada em lado nenhum.
        </p>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={handleCopy} className={SECONDARY_BUTTON} aria-live="polite">
            {copied ? 'Copiada' : 'Copiar'}
          </button>
          <button type="button" onClick={onClose} className={PRIMARY_BUTTON}>
            Já passei a palavra-passe
          </button>
        </div>
      </div>
    </Modal>
  )
}
