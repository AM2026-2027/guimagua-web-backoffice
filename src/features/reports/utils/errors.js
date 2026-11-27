export function getReportsErrorMessage(error, fallback) {
  switch (error?.code) {
    case 'permission-denied':
      return 'Não tem autorização para consultar estes relatórios.'
    case 'failed-precondition':
      return 'A consulta requer um índice do Firestore. Consulte os detalhes do erro na consola.'
    case 'unavailable':
      return 'O Firestore está temporariamente indisponível. Tente novamente.'
    default:
      return fallback
  }
}
