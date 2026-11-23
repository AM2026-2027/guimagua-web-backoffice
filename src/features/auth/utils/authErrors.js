const ERROR_MESSAGES = {
  'auth/invalid-credential': 'Email ou palavra-passe incorretos.',
  'auth/invalid-email': 'O endereço de email não é válido.',
  'auth/user-not-found': 'Não existe nenhuma conta com este email.',
  'auth/wrong-password': 'Email ou palavra-passe incorretos.',
  'auth/user-disabled': 'Esta conta foi desativada. Contacte o administrador.',
  'auth/too-many-requests':
    'Demasiadas tentativas. Aguarde alguns minutos e tente novamente.',
  'auth/network-request-failed':
    'Sem ligação à rede. Verifique a sua ligação à Internet.',
}

export function getAuthErrorMessage(code) {
  return ERROR_MESSAGES[code] || 'Ocorreu um erro inesperado. Tente novamente.'
}
