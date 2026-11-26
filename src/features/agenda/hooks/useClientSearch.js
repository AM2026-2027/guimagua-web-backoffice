import { useEffect, useState } from 'react'
import { searchAgendaClients } from '../../../services/agendaService'
import { getAgendaErrorMessage } from '../utils/errors'
import { normalizeSearchText } from '../utils/text'

const MIN_TERM_LENGTH = 2
const DEBOUNCE_MS = 300
const EMPTY_RESULT = { term: '', items: [], error: '' }

/**
 * Pesquisa de clientes para o seletor do novo agendamento. Espera 300 ms depois da última tecla e só
 * pesquisa a partir de 2 caracteres, para não gastar leituras a cada tecla (até 10 por pesquisa).
 */
export function useClientSearch(term) {
  const [result, setResult] = useState(EMPTY_RESULT)
  const normalized = normalizeSearchText(term)
  const enabled = normalized.length >= MIN_TERM_LENGTH

  useEffect(() => {
    if (!enabled) return undefined
    let ignore = false
    const timer = setTimeout(async () => {
      try {
        const items = await searchAgendaClients(normalized)
        if (!ignore) setResult({ term: normalized, items, error: '' })
      } catch (error) {
        console.error(error)
        if (!ignore) {
          setResult({
            term: normalized,
            items: [],
            error: getAgendaErrorMessage(error, 'Não foi possível pesquisar clientes.'),
          })
        }
      }
    }, DEBOUNCE_MS)
    // Limpeza: cancela a pesquisa pendente e ignora respostas de um termo anterior.
    return () => {
      ignore = true
      clearTimeout(timer)
    }
  }, [enabled, normalized])

  const current = enabled && result.term === normalized
  return {
    clients: current ? result.items.filter((client) => client.is_active !== false) : [],
    searching: enabled && !current,
    error: current ? result.error : '',
    tooShort: !enabled,
  }
}
