import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from './AuthContext'
import {
  loginWithEmail as loginService,
  logout as logoutService,
  resetPassword as resetPasswordService,
  subscribeToAuthChanges,
} from '../../../services/authService'
import { getUserProfile } from '../../../services/userService'

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    let active = true
    const unsubscribe = subscribeToAuthChanges(async (firebaseUser) => {
      if (!firebaseUser) {
        if (!active) return
        setUser(null)
        setProfile(null)
        setLoading(false)
        return
      }
      try {
        const userProfile = await getUserProfile(firebaseUser.uid)
        if (!active) return
        if (userProfile?.is_active === false) {
          await logoutService()
          if (!active) return
          setAuthError('Esta conta está inativa. Contacte o administrador.')
          setUser(null)
          setProfile(null)
        } else {
          // Sem perfil: mantém sessão com role nula; o RBAC encaminha para /sem-acesso.
          setUser(firebaseUser)
          setProfile(userProfile)
        }
      } catch {
        if (!active) return
        setAuthError('Não foi possível carregar o seu perfil. Tente novamente.')
        setUser(null)
        setProfile(null)
      } finally {
        if (active) setLoading(false)
      }
    })
    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const login = useCallback(async (email, password, rememberSession) => {
    setAuthError(null)
    await loginService(email, password, rememberSession)
  }, [])

  const logout = useCallback(async () => {
    await logoutService()
  }, [])

  const resetPassword = useCallback((email) => resetPasswordService(email), [])

  const value = useMemo(
    () => ({
      user,
      profile,
      role: profile?.role ?? null,
      loading,
      authError,
      isAuthenticated: Boolean(user),
      login,
      logout,
      resetPassword,
    }),
    [user, profile, loading, authError, login, logout, resetPassword],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
