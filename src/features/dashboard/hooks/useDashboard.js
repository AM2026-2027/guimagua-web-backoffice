import { useCallback, useEffect, useState } from 'react'
import { getDashboardSnapshot, saveAlertThresholds } from '../../../services/dashboardService'
import { getDashboardErrorMessage } from '../utils/labels'
import { resolveThresholds } from '../utils/thresholds'

/**
 * Gere o carregamento agregado do Dashboard e a parametrização dos limiares de alerta (RF-WEB05, D-11).
 */
export function useDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [savingThresholds, setSavingThresholds] = useState(false)

  useEffect(() => {
    let ignore = false

    async function loadInitial() {
      try {
        const snapshot = await getDashboardSnapshot()
        if (!ignore) {
          setData({
            ...snapshot,
            thresholds: resolveThresholds(snapshot.thresholds),
          })
          setError('')
        }
      } catch (err) {
        console.error(err)
        if (!ignore) {
          setError(getDashboardErrorMessage(err, 'Não foi possível carregar os dados do dashboard.'))
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    loadInitial()
    // Limpeza: ignora a resposta caso o componente desmonte antes do fim do pedido.
    return () => {
      ignore = true
    }
  }, [])

  const refresh = useCallback(async () => {
    setRefreshing(true)
    setActionError('')
    try {
      const snapshot = await getDashboardSnapshot()
      setData({
        ...snapshot,
        thresholds: resolveThresholds(snapshot.thresholds),
      })
      setError('')
      return true
    } catch (err) {
      console.error(err)
      const message = getDashboardErrorMessage(err, 'Não foi possível atualizar o dashboard.')
      setActionError(message)
      return false
    } finally {
      setRefreshing(false)
    }
  }, [])

  const saveThresholds = useCallback(async (payload, adminUid) => {
    setSavingThresholds(true)
    setActionError('')
    try {
      await saveAlertThresholds(payload, adminUid)
      // Atualiza os limiares localmente de forma imutável para recalcular os alertas sem novas leituras.
      setData((prev) =>
        prev
          ? {
              ...prev,
              thresholds: resolveThresholds({
                ...prev.thresholds,
                ...payload,
                updated_by: adminUid ?? null,
                updated_at: new Date(),
              }),
            }
          : prev,
      )
      return true
    } catch (err) {
      console.error(err)
      setActionError(getDashboardErrorMessage(err, 'Não foi possível guardar os limiares de alerta.'))
      return false
    } finally {
      setSavingThresholds(false)
    }
  }, [])

  const clearActionError = useCallback(() => setActionError(''), [])

  return {
    data,
    loading,
    refreshing,
    error,
    actionError,
    savingThresholds,
    refresh,
    saveThresholds,
    clearActionError,
  }
}
