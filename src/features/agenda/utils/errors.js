const FIRESTORE_MESSAGES = {
  'permission-denied': 'Sem permissões para consultar a agenda. Confirme as regras do Firestore.',
  'failed-precondition': 'A consulta precisa de um índice do Firestore. Consulte a consola do browser.',
  unavailable: 'Sem ligação ao servidor. Verifique a internet e tente novamente.',
  'deadline-exceeded': 'O servidor demorou demasiado a responder. Tente novamente.',
}

const SAVE_MESSAGES = {
  'agenda/not-scheduled':
    'Este agendamento já não está no estado "Agendado" (foi cancelado ou iniciado entretanto). Atualize a agenda.',
  'permission-denied': 'Sem permissões para gravar o agendamento. Confirme as regras do Firestore.',
  aborted: 'Os dados mudaram durante a gravação. Tente novamente.',
  unavailable: FIRESTORE_MESSAGES.unavailable,
  'deadline-exceeded': FIRESTORE_MESSAGES['deadline-exceeded'],
}

export function getAgendaErrorMessage(error, fallback = 'Não foi possível carregar a agenda.') {
  return FIRESTORE_MESSAGES[error?.code] ?? fallback
}

/** Mensagens para falhas ao gravar (criar, reagendar, cancelar). Os dados preenchidos mantêm-se. */
export function getAgendaSaveErrorMessage(error, fallback) {
  return SAVE_MESSAGES[error?.code] ?? fallback
}
