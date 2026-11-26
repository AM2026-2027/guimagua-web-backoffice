import { CARD_CLASS, LINK_BUTTON, LINK_DANGER_BUTTON } from '../../../shared/components/uiClasses'
import { ACTIVITY_STATUS, initialsOf, roleLabel, specialtyLabel } from '../utils/labels'
import { activityStatus } from '../utils/activity'

function VisitsToday({ summary, loaded }) {
  if (!loaded) return <span className="text-xs text-slate-400">A carregar...</span>
  if (!summary || summary.total === 0) return <span className="text-xs text-slate-400">Sem visitas hoje</span>
  const percent = Math.round((summary.completed / summary.total) * 100)
  return (
    <div className="w-32">
      <div className="text-xs font-medium text-slate-700">
        {summary.completed} / {summary.total} concluídas
      </div>
      <div
        className="mt-1 h-1.5 rounded-full bg-slate-100"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={summary.total}
        aria-valuenow={summary.completed}
        aria-label="Visitas concluídas hoje"
      >
        <div className="h-1.5 rounded-full bg-primary" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

/** Tabela apresentacional da equipa. `currentUid` assinala a própria conta e bloqueia a sua desativação. */
export default function TeamTable({ users, currentUid, activity, onEdit, onToggleActive, onResetPassword }) {
  return (
    <div className={`${CARD_CLASS} overflow-x-auto`}>
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <caption className="sr-only">Equipa interna</caption>
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th scope="col" className="px-4 py-3">Colaborador</th>
            <th scope="col" className="px-4 py-3">Utilizador / Telemóvel</th>
            <th scope="col" className="px-4 py-3">Especialidades</th>
            <th scope="col" className="px-4 py-3">Estado</th>
            <th scope="col" className="px-4 py-3">Visitas hoje</th>
            <th scope="col" className="px-4 py-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {users.map((user) => {
            const isSelf = user.id === currentUid
            const active = user.is_active !== false
            const summary = activity.byTech.get(user.id)
            const status = ACTIVITY_STATUS[activityStatus(user, summary)]
            const specialties = Array.isArray(user.specialties) ? user.specialties : []
            return (
              <tr key={user.id} className={active ? '' : 'bg-slate-50/60 text-slate-500'}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
                    >
                      {initialsOf(user.name)}
                    </span>
                    <div>
                      <div className="font-medium text-slate-800">
                        {user.name || '—'}
                        {isSelf && <span className="ml-2 text-xs font-normal text-slate-500">(você)</span>}
                      </div>
                      <div className="text-xs text-slate-500">{roleLabel(user.role)}</div>
                      {user.must_change_password && (
                        <div className="mt-1 inline-block rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-800 ring-1 ring-amber-200">
                          Tem de mudar a palavra-passe
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-mono text-slate-700">{user.username || '—'}</div>
                  <div className="text-xs text-slate-500">{user.phone || '—'}</div>
                </td>
                <td className="px-4 py-3">
                  {specialties.length === 0 ? (
                    <span className="text-xs text-slate-400">—</span>
                  ) : (
                    <ul className="flex max-w-xs flex-wrap gap-1" aria-label="Especialidades">
                      {specialties.slice(0, 2).map((value) => (
                        <li key={value} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                          {specialtyLabel(value)}
                        </li>
                      ))}
                      {specialties.length > 2 && (
                        <li className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">+{specialties.length - 2}</li>
                      )}
                    </ul>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${status.className}`}>
                    <span aria-hidden="true">•</span>
                    {status.label}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <VisitsToday summary={summary} loaded={activity.loaded} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => onEdit(user)} className={LINK_BUTTON} aria-label={`Editar ${user.name}`}>
                      Editar
                    </button>
                    {active && (
                      <button
                        type="button"
                        onClick={() => onResetPassword(user)}
                        className={LINK_BUTTON}
                        aria-label={`Repor palavra-passe de ${user.name}`}
                      >
                        Repor palavra-passe
                      </button>
                    )}
                    {!isSelf && (
                      <button
                        type="button"
                        onClick={() => onToggleActive(user)}
                        className={active ? LINK_DANGER_BUTTON : LINK_BUTTON}
                        aria-label={`${active ? 'Desativar' : 'Reativar'} ${user.name}`}
                      >
                        {active ? 'Desativar' : 'Reativar'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
