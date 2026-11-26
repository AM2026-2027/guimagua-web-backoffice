// Mensagens PT-PT para os erros do Firebase Auth e do Firestore (o código vem em `error.code`).
const MESSAGES = {
  'auth/email-already-in-use': 'O email indicado já está associado a outra conta.',
  'auth/invalid-email': 'O email indicado não é válido.',
  'auth/operation-not-allowed': 'O registo por email e palavra-passe não está ativo no Firebase Authentication.',
  'auth/network-request-failed': 'Sem ligação ao servidor. Verifique a internet e tente novamente.',
  'auth/too-many-requests': 'Demasiados pedidos seguidos. Aguarde um pouco e tente novamente.',
  'permission-denied': 'Sem permissões para esta operação. Confirme as regras do Firestore para o administrador.',
  unavailable: 'Sem ligação ao servidor. Verifique a internet e tente novamente.',
  'failed-precondition': 'Falta um índice no Firestore para esta consulta. Crie-o a partir do link na consola do browser.',
  'team/self-protection': 'Não pode alterar o seu próprio perfil de acesso nem desativar a sua própria conta.',
  'team/admin-protected': 'A conta de administrador não é gerida neste módulo.',
  'team/username-taken': 'Este nome de utilizador já está atribuído. Volte a abrir o formulário para receber outra sugestão.',
}

export function getTeamErrorMessage(error, fallback = 'Ocorreu um erro inesperado. Tente novamente.') {
  return MESSAGES[error?.code] ?? fallback
}
