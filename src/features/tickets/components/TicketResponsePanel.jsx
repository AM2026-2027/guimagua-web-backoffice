import ErrorAlert from '../../../shared/components/ErrorAlert'
import FormField from '../../../shared/components/FormField'
import {
  CARD_CLASS,
  INPUT_CLASS,
  PRIMARY_BUTTON,
  SECONDARY_BUTTON,
} from '../../../shared/components/uiClasses'
import { formatTicketDateTime } from '../utils/labels'

export default function TicketResponsePanel({
  ticket,
  responseMessage,
  formError,
  actionError,
  saving,
  onChange,
  onSubmit,
  onDismissError,
  onRetry,
  responseFormRef,
}) {
  const client = ticket.client

  return (
    <section
      ref={responseFormRef}
      className={`${CARD_CLASS} space-y-4 p-5`}
      aria-labelledby="ticket-response-title"
    >
      <div>
        <h2 id="ticket-response-title" className="font-semibold text-slate-800">
          Mensagem ao Cliente (WhatsApp/Email)
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          A resposta fica registada no pedido; o envio é manual e não é automático.
        </p>
        <div className="mt-2 flex flex-wrap gap-3 text-sm">
          {client?.email && (
            <a href={`mailto:${client.email}`} className="text-primary hover:underline">
              Abrir email
            </a>
          )}
          {client?.phone && (
            <a
              href={`tel:${client.phone.replace(/[^\d+]/g, '')}`}
              className="text-primary hover:underline"
            >
              Ligar ao cliente
            </a>
          )}
        </div>
      </div>

      {ticket.status === 'in_analysis' ? (
        <form onSubmit={onSubmit} noValidate className="space-y-3">
          <FormField
            id="ticket-response-message"
            label="Resposta a registar"
            required
            error={formError}
          >
            {(fieldProps) => (
              <textarea
                {...fieldProps}
                name="responseMessage"
                value={responseMessage}
                onChange={onChange}
                rows={5}
                disabled={saving}
                className={INPUT_CLASS}
              />
            )}
          </FormField>
          <ErrorAlert message={actionError} onClose={onDismissError} />
          {actionError && (
            <button type="button" onClick={onRetry} className={SECONDARY_BUTTON}>
              Atualizar pedido
            </button>
          )}
          <button type="submit" disabled={saving} className={PRIMARY_BUTTON}>
            {saving ? 'A guardar...' : 'Registar resposta e concluir'}
          </button>
        </form>
      ) : ticket.status === 'responded' ? (
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Resposta registada
            {ticket.responded_at ? ` · ${formatTicketDateTime(ticket.responded_at)}` : ''}
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">
            {ticket.response_message || 'Não foi registado texto de resposta.'}
          </p>
        </div>
      ) : (
        <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
          Inicie a triagem para poder registar uma resposta ao cliente.
        </p>
      )}
    </section>
  )
}
