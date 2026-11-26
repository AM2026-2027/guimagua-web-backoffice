import { useCallback, useState } from 'react'
import LoadingSpinner from '../../../shared/components/LoadingSpinner'
import ErrorAlert from '../../../shared/components/ErrorAlert'
import ConfirmDialog from '../../../shared/components/ConfirmDialog'
import Notice from '../../../shared/components/Notice'
import { CARD_CLASS, PRIMARY_BUTTON, SECONDARY_BUTTON } from '../../../shared/components/uiClasses'
import { ROLES } from '../../../constants/roles'
import { useAuth } from '../../auth/hooks/useAuth'
import { useTeam } from '../hooks/useTeam'
import { useTodayActivity } from '../hooks/useTodayActivity'
import StaffFormModal from '../components/StaffFormModal'
import TemporaryPasswordDialog from '../components/TemporaryPasswordDialog'
import TeamStats from '../components/TeamStats'
import { TEAM_CARD_FILTERS } from '../utils/labels'
import TeamTable from '../components/TeamTable'
import TeamToolbar from '../components/TeamToolbar'
import { activityStatus } from '../utils/activity'

/** Regra de cada cartão filtrante (null = sem filtro). */
function matchesCardFilter(user, filter, activity) {
  const active = user.is_active !== false
  switch (filter) {
    case 'technicians':
      return active && user.role === ROLES.TECHNICIAN
    case 'commercials':
      return active && user.role === ROLES.COMMERCIAL
    case 'in_service':
      return active && activityStatus(user, activity.byTech.get(user.id)) === 'in_service'
    case 'visits_today':
      return active && activity.byTech.get(user.id)?.total > 0
    case 'inactive':
      return !active
    default:
      return true
  }
}

function normalizeText(value = '') {
  return String(value).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

/**
 * Equipa & Técnicos (RF-WEB02, US04, D-08, D-16): contas de técnicos e comerciais para a App Guimágua.
 * O admin é uma conta única do backoffice e não aparece nem é editável aqui.
 * O estado vive aqui; os componentes são apresentacionais.
 */
export default function TeamPage() {
  const { user: authUser } = useAuth()
  const currentUid = authUser?.uid ?? null
  const [notice, setNotice] = useState('')
  const clearNotice = useCallback(() => setNotice(''), [])
  // Palavra-passe temporária da conta acabada de criar: só em memória, apagada ao fechar o diálogo.
  const [createdCredentials, setCreatedCredentials] = useState(null)

  const team = useTeam({
    currentUid,
    onCreated: ({ user, temporaryPassword }) =>
      setCreatedCredentials({ name: user.name, username: user.username, email: user.email, password: temporaryPassword }),
  })
  const activity = useTodayActivity()

  const [searchTerm, setSearchTerm] = useState('')
  // Filtro dos cartões de totais (chave de TEAM_CARD_FILTERS) ou null para mostrar todos.
  const [statFilter, setStatFilter] = useState(null)
  // { user: null } = criar; { user } = editar.
  const [formTarget, setFormTarget] = useState(null)
  // { type: 'toggle' | 'reset', user }
  const [confirm, setConfirm] = useState(null)

  // Estado derivado: filtros, ordenação e totais calculados na renderização.
  const term = normalizeText(searchTerm.trim())
  const visibleUsers = team.users
    .filter((user) => matchesCardFilter(user, statFilter, activity))
    .filter((user) => !term || [user.name, user.username, user.email, user.phone].some((value) => normalizeText(value).includes(term)))
    .toSorted((a, b) => normalizeText(a.name).localeCompare(normalizeText(b.name), 'pt-PT'))

  const takenUsernames = new Set(team.users.map((user) => user.username).filter(Boolean))
  const activeUsers = team.users.filter((user) => user.is_active !== false)
  const stats = {
    activeTechnicians: activeUsers.filter((user) => user.role === ROLES.TECHNICIAN).length,
    activeCommercials: activeUsers.filter((user) => user.role === ROLES.COMMERCIAL).length,
    inService: activity.loaded
      ? activeUsers.filter((user) => activityStatus(user, activity.byTech.get(user.id)) === 'in_service').length
      : null,
    visitsToday: activity.loaded && !activity.error ? activity.totalToday : null,
    withVisitsToday: activity.loaded && !activity.error ? activeUsers.filter((user) => activity.byTech.get(user.id)?.total > 0).length : null,
    inactive: team.users.length - activeUsers.length,
  }

  function openForm(target) {
    team.clearActionError()
    setFormTarget(target)
  }

  async function handleSubmit(payload) {
    const editing = formTarget?.user
    const ok = editing ? await team.updateStaff(editing, payload) : await team.createStaff(payload)
    if (ok) {
      setFormTarget(null)
      if (editing) setNotice(`Ficha de ${payload.name} guardada.`)
    }
    return ok
  }

  async function handleConfirm() {
    const { type, user } = confirm
    if (type === 'reset') {
      const ok = await team.resetPassword(user)
      if (ok) {
        setConfirm(null)
        setNotice(
          `Link de reposição enviado para ${user.email}. Abra-o, defina a palavra-passe genérica e passe-a a ${user.name}: no próximo início de sessão a App obriga a escolher uma nova.`,
        )
      }
      return ok
    }
    const activate = user.is_active === false
    const ok = await team.setActive(user, activate)
    if (ok) {
      setConfirm(null)
      setNotice(`Conta de ${user.name} ${activate ? 'reativada' : 'desativada'}.`)
    }
    return ok
  }

  const confirmCopy = (() => {
    if (!confirm) return null
    const { type, user } = confirm
    if (type === 'reset') {
      return {
        title: 'Repor palavra-passe',
        message: `O Firebase envia para ${user.email} um link para definir uma palavra-passe nova. Depois de a definir e a passar a ${user.name}, a App obriga-o a escolher outra no início de sessão seguinte.`,
        confirmLabel: 'Enviar link de reposição',
        danger: false,
      }
    }
    return user.is_active === false
      ? { title: 'Reativar conta', message: `${user.name} volta a poder iniciar sessão nas apps.`, confirmLabel: 'Reativar', danger: false }
      : {
          title: 'Desativar conta',
          message: `${user.name} deixa de poder iniciar sessão nas apps e sai da escala de agendamentos. A conta não é apagada e pode ser reativada.`,
          confirmLabel: 'Desativar',
          danger: true,
        }
  })()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Diretório técnico</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-800">Gestão de Técnicos & Equipas</h1>
          <p className="mt-1 text-sm text-slate-500">Contas de acesso à App Guimágua, especialidades e atividade diária de técnicos e comerciais.</p>
        </div>
        <button type="button" onClick={() => openForm({ user: null })} className={PRIMARY_BUTTON}>
          + Novo colaborador
        </button>
      </div>

      <Notice message={notice} onClose={clearNotice} />

      {team.pendingProfile && !formTarget && (
        <div role="alert" className="flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
          <span>
            A conta de <strong>{team.pendingProfile.username}</strong> foi criada no Firebase Authentication, mas falta gravar o perfil.
          </span>
          <button type="button" onClick={() => openForm({ user: null })} className={SECONDARY_BUTTON}>
            Concluir registo
          </button>
        </div>
      )}

      <TeamStats
        {...stats}
        activeFilter={statFilter}
        onToggleFilter={(filter) => setStatFilter((current) => (current === filter ? null : filter))}
      />

      <TeamToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {statFilter && (
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <span>
            A mostrar só <strong>{TEAM_CARD_FILTERS[statFilter]}</strong>.
          </span>
          <button type="button" onClick={() => setStatFilter(null)} className="font-medium text-primary hover:underline">
            Limpar filtro
          </button>
        </div>
      )}

      {activity.error && <ErrorAlert message={activity.error} />}

      {team.loading ? (
        <LoadingSpinner label="A carregar equipa..." />
      ) : team.error ? (
        <div className="space-y-3">
          <ErrorAlert message={team.error} />
          <button type="button" onClick={team.reload} className={SECONDARY_BUTTON}>
            Tentar novamente
          </button>
        </div>
      ) : visibleUsers.length === 0 ? (
        <div className={`${CARD_CLASS} p-8 text-center text-sm text-slate-500`}>
          {team.users.length === 0 ? 'Ainda não há colaboradores registados.' : 'Nenhum colaborador corresponde aos filtros.'}
        </div>
      ) : (
        <>
          <TeamTable
            users={visibleUsers}
            currentUid={currentUid}
            activity={activity}
            onEdit={(user) => openForm({ user })}
            onToggleActive={(user) => {
              team.clearActionError()
              setConfirm({ type: 'toggle', user })
            }}
            onResetPassword={(user) => {
              team.clearActionError()
              setConfirm({ type: 'reset', user })
            }}
          />
          <p className="text-sm text-slate-500">
            A mostrar {visibleUsers.length} de {team.users.length} colaborador{team.users.length === 1 ? '' : 'es'}
          </p>
        </>
      )}

      {formTarget && (
        <StaffFormModal
          key={formTarget.user?.id ?? 'new-staff'}
          user={formTarget.user}
          isSelf={formTarget.user?.id === currentUid}
          pending={formTarget.user ? null : team.pendingProfile}
          takenUsernames={takenUsernames}
          emailBase={team.emailBase}
          serverError={team.actionError}
          onDismissError={team.clearActionError}
          onSubmit={handleSubmit}
          onClose={() => setFormTarget(null)}
        />
      )}

      {createdCredentials && (
        <TemporaryPasswordDialog
          {...createdCredentials}
          onClose={() => {
            setNotice(`Conta de ${createdCredentials.name} criada (utilizador ${createdCredentials.username}).`)
            setCreatedCredentials(null)
          }}
        />
      )}

      {confirm && confirmCopy && (
        <ConfirmDialog
          {...confirmCopy}
          error={team.actionError}
          onDismissError={team.clearActionError}
          onConfirm={handleConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}
