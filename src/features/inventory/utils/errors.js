// Mensagens PT-PT para os erros do Firestore e do inventário (o código vem em `error.code`).
const MESSAGES = {
  'permission-denied': 'Sem permissões para esta operação. Confirme as regras do Firestore para o administrador.',
  'failed-precondition': 'Falta um índice no Firestore para esta consulta. Crie-o a partir do link na consola do browser.',
  unavailable: 'Sem ligação ao servidor. Verifique a internet e tente novamente.',
  'inventory/negative-stock': 'A saída não pode deixar o stock físico negativo.',
}

export function getInventoryErrorMessage(error, fallback = 'Ocorreu um erro inesperado. Tente novamente.') {
  return MESSAGES[error?.code] ?? fallback
}
