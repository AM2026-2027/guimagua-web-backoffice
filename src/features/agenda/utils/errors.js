const FIRESTORE_MESSAGES = {
  'permission-denied': 'Sem permissões para consultar a agenda. Confirme as regras do Firestore.',
  'failed-precondition': 'A consulta precisa de um índice do Firestore. Consulte a consola do browser.',
  unavailable: 'Sem ligação ao servidor. Verifique a internet e tente novamente.',
  'deadline-exceeded': 'O servidor demorou demasiado a responder. Tente novamente.',
}

export function getAgendaErrorMessage(error, fallback = 'Não foi possível carregar a agenda.') {
  return FIRESTORE_MESSAGES[error?.code] ?? fallback
}
