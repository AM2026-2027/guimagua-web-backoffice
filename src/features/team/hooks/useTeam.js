import { useCallback, useEffect, useState } from 'react'
import {
  PROFILE_SAVE_FAILED,
  createStaffAccount,
  getStaffEmailBase,
  listStaffUsers,
  requestStaffPasswordReset,
  saveStaffProfile,
  setUserActive,
  updateStaffUser,
} from '../../../services/userService'
import { getTeamErrorMessage } from '../utils/errors'

const EMPTY = { key: null, users: [], error: '' }

function selfProtectionError() {
  const error = new Error('Operação bloqueada sobre a própria conta')
  error.code = 'team/self-protection'
  return error
}

// Defesa extra: a conta admin (única) nunca é alterada a partir do módulo team.
function assertManageable(user) {
  if (user.role === 'admin') {
    const error = new Error('Conta admin não gerida no módulo team')
    error.code = 'team/admin-protected'
    throw error
  }
}

function replaceById(items, updated) {
  return items.map((item) => (item.id === updated.id ? updated : item))
}

/**
 * Técnicos e comerciais (users com role technician/commercial): lista carregada uma vez e operações.
 * A conta admin é única e gerida fora deste módulo: qualquer operação sobre ela é recusada.
 * As operações devolvem true/false. `currentUid` é o admin autenticado: não pode alterar o próprio
 * role nem desativar a própria conta (regra obrigatória do módulo, verificada aqui além da UI).
 * `onCreated({ user, temporaryPassword })` entrega à página a palavra-passe temporária, para a mostrar
 * uma única vez ao admin. A palavra-passe só existe em memória e nunca é guardada no Firestore.
 */
export function useTeam({ currentUid, onCreated } = {}) {
  const [reloadToken, setReloadToken] = useState(0)
  const [state, setState] = useState(EMPTY)
  const [actionError, setActionError] = useState('')
  // Conta criada no Auth cujo documento `users/{uid}` falhou: guarda o uid (e a palavra-passe temporária,
  // só em memória) para repetir só a gravação (D-08).
  const [pendingProfile, setPendingProfile] = useState(null)

  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        const users = await listStaffUsers()
        if (!ignore) setState({ key: reloadToken, users, error: '' })
      } catch (error) {
        console.error(error)
        if (!ignore) setState({ ...EMPTY, key: reloadToken, error: getTeamErrorMessage(error, 'Não foi possível carregar a equipa.') })
      }
    }
    load()
    // Limpeza: ignora a resposta se o pedido for repetido antes de chegar.
    return () => {
      ignore = true
    }
  }, [reloadToken])

  const reload = useCallback(() => setReloadToken((token) => token + 1), [])
  const clearActionError = useCallback(() => setActionError(''), [])

  async function run(action, fallback) {
    setActionError('')
    try {
      await action()
      return true
    } catch (error) {
      console.error(error)
      setActionError(getTeamErrorMessage(error, fallback))
      return false
    }
  }

  function addUser(user) {
    setState((prev) => ({ ...prev, users: [...prev.users.filter((item) => item.id !== user.id), user] }))
  }

  async function createStaff(payload) {
    setActionError('')
    try {
      // O username tem de ser único: confirma de novo contra a lista carregada antes de criar a conta.
      if (!pendingProfile && state.users.some((user) => user.username === payload.username)) {
        const error = new Error('Username já usado')
        error.code = 'team/username-taken'
        throw error
      }
      if (pendingProfile) {
        // Repetir só a gravação do perfil, com o email da conta já criada no Auth.
        const user = await saveStaffProfile(pendingProfile.uid, {
          ...payload,
          email: pendingProfile.email,
          username: pendingProfile.username,
        })
        const { temporaryPassword } = pendingProfile
        setPendingProfile(null)
        addUser(user)
        onCreated?.({ user, temporaryPassword })
        return true
      }

      const { profile, temporaryPassword } = await createStaffAccount(payload)
      addUser(profile)
      onCreated?.({ user: profile, temporaryPassword })
      return true
    } catch (error) {
      console.error(error)
      if (error.code === PROFILE_SAVE_FAILED) {
        setPendingProfile({
          uid: error.uid,
          email: payload.email,
          username: payload.username,
          temporaryPassword: error.temporaryPassword,
        })
        setActionError(
          'A conta foi criada no Firebase Authentication, mas o perfil não foi gravado. Carregue em "Concluir registo" para tentar gravar só o perfil.',
        )
      } else {
        setActionError(getTeamErrorMessage(error, 'Não foi possível criar a conta.'))
      }
      return false
    }
  }

  function updateStaff(user, payload) {
    return run(async () => {
      assertManageable(user)
      if (payload.role === 'admin') assertManageable(payload)
      if (user.id === currentUid && payload.role !== user.role) throw selfProtectionError()
      await updateStaffUser(user.id, payload)
      setState((prev) => ({ ...prev, users: replaceById(prev.users, { ...user, ...payload }) }))
    }, 'Não foi possível guardar as alterações.')
  }

  function setActive(user, isActive) {
    return run(async () => {
      assertManageable(user)
      if (user.id === currentUid && !isActive) throw selfProtectionError()
      await setUserActive(user.id, isActive)
      setState((prev) => ({ ...prev, users: replaceById(prev.users, { ...user, is_active: isActive }) }))
    }, 'Não foi possível alterar o estado da conta.')
  }

  /** Envia o link de reposição para o email da conta e marca `must_change_password` (sem Admin SDK nem custos). */
  function resetPassword(user) {
    return run(async () => {
      assertManageable(user)
      await requestStaffPasswordReset(user.id, user.email)
      setState((prev) => ({ ...prev, users: replaceById(prev.users, { ...user, must_change_password: true }) }))
    }, 'Não foi possível enviar o email de reposição da palavra-passe.')
  }

  const loading = state.key !== reloadToken

  return {
    users: loading ? [] : state.users,
    emailBase: getStaffEmailBase(),
    loading,
    error: loading ? '' : state.error,
    reload,
    actionError,
    clearActionError,
    pendingProfile,
    createStaff,
    updateStaff,
    setActive,
    resetPassword,
  }
}
