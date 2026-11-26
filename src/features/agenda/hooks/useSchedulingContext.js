import { useEffect, useMemo, useState } from 'react'
import {
  getConsumablesByIds,
  listAppointmentsInRange,
  listPoolsByClient,
} from '../../../services/agendaService'
import { getLisbonDayRange } from '../utils/date'
import { getAgendaErrorMessage } from '../utils/errors'
import { overlapReadWindow } from '../utils/schedule'

const EMPTY = { key: null, items: [], error: '' }
const EMPTY_ITEMS = []

function isDateKey(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value ?? '')
}

/**
 * Dados de que o formulário de agendamento depende, lidos só quando a escolha correspondente muda:
 * - piscinas do cliente escolhido (`where client_id ==`);
 * - consumíveis previstos pelo serviço (`documentId in`), para o alerta de rutura;
 * - agendamentos do dia escolhido (intervalo em `date`), para marcar quem está ocupado.
 * Cada resultado guarda a chave com que foi pedido; respostas de uma escolha anterior são ignoradas.
 */
export function useSchedulingContext({ clientId, consumableIds, dateKey }) {
  const [pools, setPools] = useState(EMPTY)
  const [consumables, setConsumables] = useState(EMPTY)
  const [day, setDay] = useState(EMPTY)
  const [dayToken, setDayToken] = useState(0)

  useEffect(() => {
    if (!clientId) return undefined
    let ignore = false
    listPoolsByClient(clientId)
      .then((items) => {
        if (!ignore) setPools({ key: clientId, items, error: '' })
      })
      .catch((error) => {
        console.error(error)
        if (!ignore) {
          setPools({ key: clientId, items: [], error: getAgendaErrorMessage(error, 'Não foi possível carregar as piscinas.') })
        }
      })
    // Limpeza: ignora a resposta se o cliente mudar ou o formulário fechar entretanto.
    return () => {
      ignore = true
    }
  }, [clientId])

  const consumablesKey = consumableIds.toSorted().join('|')

  useEffect(() => {
    if (!consumablesKey) return undefined
    let ignore = false
    getConsumablesByIds(consumablesKey.split('|'))
      .then((items) => {
        if (!ignore) setConsumables({ key: consumablesKey, items, error: '' })
      })
      .catch((error) => {
        console.error(error)
        if (!ignore) {
          setConsumables({
            key: consumablesKey,
            items: [],
            error: getAgendaErrorMessage(error, 'Não foi possível consultar o stock dos consumíveis.'),
          })
        }
      })
    // Limpeza: ignora a resposta se o serviço mudar entretanto.
    return () => {
      ignore = true
    }
  }, [consumablesKey])

  const dayKey = isDateKey(dateKey) ? `${dateKey}:${dayToken}` : null

  useEffect(() => {
    if (!dayKey) return undefined
    let ignore = false
    const { start, end } = getLisbonDayRange(dateKey)
    const range = overlapReadWindow(start, end)
    listAppointmentsInRange(range.start, range.end)
      .then((items) => {
        if (!ignore) setDay({ key: dayKey, items, error: '' })
      })
      .catch((error) => {
        console.error(error)
        if (!ignore) {
          setDay({
            key: dayKey,
            items: [],
            error: getAgendaErrorMessage(error, 'Não foi possível verificar a disponibilidade da equipa.'),
          })
        }
      })
    // Limpeza: ignora a resposta se a data mudar entretanto.
    return () => {
      ignore = true
    }
  }, [dateKey, dayKey])

  const consumablesById = useMemo(
    () =>
      consumables.key === consumablesKey && consumablesKey
        ? Object.fromEntries(consumables.items.map((item) => [item.id, item]))
        : {},
    [consumables, consumablesKey],
  )

  const poolsCurrent = Boolean(clientId) && pools.key === clientId
  const consumablesCurrent = !consumablesKey || consumables.key === consumablesKey
  const dayCurrent = Boolean(dayKey) && day.key === dayKey

  return {
    pools: poolsCurrent ? pools.items.filter((pool) => pool.is_active !== false) : EMPTY_ITEMS,
    poolsLoading: Boolean(clientId) && !poolsCurrent,
    poolsError: poolsCurrent ? pools.error : '',
    consumablesById,
    consumablesLoading: !consumablesCurrent,
    consumablesError: consumablesCurrent && consumablesKey ? consumables.error : '',
    dayAppointments: dayCurrent ? day.items : EMPTY_ITEMS,
    dayLoading: Boolean(dayKey) && !dayCurrent,
    dayError: dayCurrent ? day.error : '',
    refreshDay: () => setDayToken((token) => token + 1),
  }
}
