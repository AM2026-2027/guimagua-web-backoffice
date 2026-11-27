// Mensagens PT-PT para os erros do Firestore (o código vem em `error.code`).
const MESSAGES = {
  'permission-denied': 'Sem permissões para esta consulta. Confirme as regras do Firestore para o administrador.',
  'failed-precondition':
    'Falta um índice no Firestore para esta combinação de filtros. Crie-o a partir do link que aparece na consola do browser.',
  unavailable: 'Sem ligação ao servidor. Verifique a internet e tente novamente.',
}

export function getReportsErrorMessage(error, fallback = 'Ocorreu um erro inesperado. Tente novamente.') {
  return MESSAGES[error?.code] ?? fallback
}
