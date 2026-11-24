import {
  createClient,
  isClientEmailTaken,
  setClientActive,
  updateClient,
} from '../../../services/clientsService'
import { EMAIL_TAKEN_CODE } from '../utils/errors'

// Operações sobre clientes partilhadas pelos hooks da lista e da ficha. Lançam erro em caso de falha;
// quem chama (o hook) converte o erro em mensagem e devolve true/false à página.

function emailTakenError() {
  const error = new Error('Email já registado')
  error.code = EMAIL_TAKEN_CODE
  return error
}

/** US01: impede dois clientes com o mesmo email antes de gravar. */
export async function persistNewClient(payload) {
  if (await isClientEmailTaken(payload.email)) throw emailTakenError()
  return createClient(payload)
}

/** Na edição só se verifica o email se ele mudou, excluindo o próprio cliente. */
export async function persistClientUpdate(client, payload) {
  if (payload.email !== client.email && (await isClientEmailTaken(payload.email, client.id))) {
    throw emailTakenError()
  }
  await updateClient(client.id, payload)
  return { ...client, ...payload }
}

export async function persistClientActive(client, isActive) {
  await setClientActive(client.id, isActive)
  return { ...client, is_active: isActive }
}
