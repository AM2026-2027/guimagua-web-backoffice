import { useEffect, useState } from 'react'
import { getAlertThresholds, getLatestPoolReading } from '../../../services/agendaService'
import { getAgendaErrorMessage } from '../utils/errors'

const EMPTY_DETAIL = { poolId: null, reading: null, thresholds: null, error: '', loading: false }

export function useAppointmentDetail(poolId) {
  const [detail, setDetail] = useState(EMPTY_DETAIL)
  const [thresholdState, setThresholdState] = useState({ poolId: null, value: null, error: '' })

  useEffect(() => {
    if (!poolId) return undefined
    let ignore = false
    async function loadThresholds() {
      try {
        const result = await getAlertThresholds()
        if (!ignore) setThresholdState({ poolId, value: result, error: '' })
      } catch (error) {
        console.error(error)
        if (!ignore) {
          setThresholdState({
            poolId,
            value: null,
            error: getAgendaErrorMessage(error, 'Não foi possível carregar os limiares de alerta.'),
          })
        }
      }
    }

    loadThresholds()
    // Limpeza: ignora a resposta se a página desmontar antes de carregar os limiares.
    return () => {
      ignore = true
    }
  }, [poolId])

  useEffect(() => {
    if (!poolId) return undefined

    let ignore = false
    getLatestPoolReading(poolId)
      .then((reading) => {
        if (!ignore) setDetail({ poolId, reading, thresholds: null, error: '', loading: false })
      })
      .catch((error) => {
        console.error(error)
        if (!ignore) {
          setDetail({
            poolId,
            reading: null,
            thresholds: null,
            error: getAgendaErrorMessage(error, 'Não foi possível carregar a leitura da piscina.'),
            loading: false,
          })
        }
      })
    // Limpeza: ignora a leitura da piscina anterior se a intervenção ativa mudar.
    return () => {
      ignore = true
    }
  }, [poolId])

  return {
    reading: poolId && detail.poolId === poolId ? detail.reading : null,
    loading: Boolean(poolId) && (detail.poolId !== poolId || detail.loading),
    error: poolId && detail.poolId === poolId ? detail.error : '',
    thresholds: poolId && thresholdState.poolId === poolId ? thresholdState.value : null,
    thresholdsLoading: Boolean(poolId) && thresholdState.poolId !== poolId,
    thresholdsError: poolId && thresholdState.poolId === poolId ? thresholdState.error : '',
  }
}
