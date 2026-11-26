// Ordenação da tabela da equipa, calculada na renderização sobre uma cópia (não altera o estado).

export const TEAM_SORT_OPTIONS = [
  { value: 'name', label: 'Nome (A-Z)' },
  { value: 'recent', label: 'Recentes' },
  { value: 'username', label: 'Nome de utilizador' },
  { value: 'visits_today', label: 'Visitas hoje' },
]

function normalize(value = '') {
  return String(value ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

function createdAtMs(user) {
  const value = user.created_at
  const date = typeof value?.toDate === 'function' ? value.toDate() : null
  return date ? date.getTime() : 0
}

const byName = (a, b) => normalize(a.name).localeCompare(normalize(b.name), 'pt-PT')

/**
 * 'name': nome A-Z; 'recent': conta mais recente primeiro; 'username': nome de utilizador A-Z (sem username no fim);
 * 'visits_today': mais visitas hoje primeiro (`visitsByUser` é o Map uid → { total }). Empates ordenados pelo nome.
 */
export function sortStaff(users, sort, visitsByUser) {
  switch (sort) {
    case 'recent':
      return users.toSorted((a, b) => createdAtMs(b) - createdAtMs(a) || byName(a, b))
    case 'username':
      return users.toSorted((a, b) => {
        if (!a.username !== !b.username) return a.username ? -1 : 1
        return normalize(a.username).localeCompare(normalize(b.username), 'pt-PT') || byName(a, b)
      })
    case 'visits_today':
      return users.toSorted(
        (a, b) => (visitsByUser.get(b.id)?.total ?? 0) - (visitsByUser.get(a.id)?.total ?? 0) || byName(a, b),
      )
    default:
      return users.toSorted(byName)
  }
}
