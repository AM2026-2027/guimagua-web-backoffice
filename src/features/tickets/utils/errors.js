const MESSAGES = {
  'permission-denied': 'Sem permissões para esta operação. Confirme as regras do Firestore para o administrador.',
  'failed-precondition': 'Falta um índice no Firestore para esta consulta. Consulte o erro na consola do browser.',
  unavailable: 'Sem ligação ao servidor. Verifique a internet e tente novamente.',
  'deadline-exceeded': 'O servidor demorou demasiado a responder. Tente novamente.',
  'ticket/not-found': 'O pedido já não existe ou não está disponível.',
  'ticket/invalid-transition': 'O estado do pedido mudou. Atualize os dados e tente novamente.',
}

export function getTicketsErrorMessage(error, fallback = 'Ocorreu um erro inesperado. Tente novamente.') {
  return MESSAGES[error?.code] ?? fallback
}
