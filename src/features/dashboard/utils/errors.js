// Mensagens PT-PT para os erros mais comuns do Firestore (o código vem em `error.code`).
const MESSAGES = {
  'permission-denied': 'Sem permissões para aceder aos dados do dashboard. Confirme as regras do Firestore.',
  'failed-precondition':
    'Falta um índice no Firestore para esta consulta. Crie-o a partir do link que aparece na consola do browser.',
  unavailable: 'Sem ligação ao servidor. Verifique a internet e tente novamente.',
  'deadline-exceeded': 'O servidor demorou demasiado a responder. Tente novamente.',
}

export function getDashboardErrorMessage(error, fallback = 'Ocorreu um erro inesperado. Tente novamente.') {
  return MESSAGES[error?.code] ?? fallback
}
