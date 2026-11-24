// Mensagens PT-PT para os erros mais comuns do Firestore (o código vem em `error.code`).
const MESSAGES = {
  'permission-denied': 'Sem permissões para esta operação. Confirme as regras do Firestore para o administrador.',
  'failed-precondition':
    'Falta um índice no Firestore para esta consulta. Crie-o a partir do link que aparece na consola do browser.',
  unavailable: 'Sem ligação ao servidor. Verifique a internet e tente novamente.',
  'deadline-exceeded': 'O servidor demorou demasiado a responder. Tente novamente.',
}

export const EMAIL_TAKEN_CODE = 'clients/email-taken'

export function getClientsErrorMessage(error, fallback = 'Ocorreu um erro inesperado. Tente novamente.') {
  if (error?.code === EMAIL_TAKEN_CODE) return 'Já existe um cliente com este endereço de email.'
  return MESSAGES[error?.code] ?? fallback
}
