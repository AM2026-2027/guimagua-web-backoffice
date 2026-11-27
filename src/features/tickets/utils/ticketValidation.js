const TICKET_CATEGORIES = new Set(['quote', 'breakdown', 'maintenance'])

export function validateTicketForm(form, pools = []) {
  const errors = {}
  const description = form.description.trim()

  if (!form.client_id) errors.client_id = 'Selecione um cliente.'
  if (!form.pool_id) errors.pool_id = 'Selecione uma piscina.'
  else if (!pools.some((pool) => pool.id === form.pool_id)) {
    errors.pool_id = 'Selecione uma piscina pertencente ao cliente escolhido.'
  }
  if (!TICKET_CATEGORIES.has(form.category)) errors.category = 'Selecione um tipo de pedido válido.'
  if (description.length < 10 || description.length > 1000) {
    errors.description = 'A descrição deve ter entre 10 e 1000 caracteres.'
  }

  return errors
}
