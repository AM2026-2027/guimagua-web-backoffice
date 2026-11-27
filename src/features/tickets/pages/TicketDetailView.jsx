import { useCallback, useEffect, useRef, useState } from 'react'
import ConfirmDialog from '../../../shared/components/ConfirmDialog'
import ErrorAlert from '../../../shared/components/ErrorAlert'
import LoadingSpinner from '../../../shared/components/LoadingSpinner'
import Notice from '../../../shared/components/Notice'
import { CARD_CLASS, SECONDARY_BUTTON } from '../../../shared/components/uiClasses'
import ClientProfileCard from '../components/ClientProfileCard'
import PoolInterventionsPanel from '../components/PoolInterventionsPanel'
import PoolReadingsCard from '../components/PoolReadingsCard'
import PoolSummaryCard from '../components/PoolSummaryCard'
import TicketEquipmentCard from '../components/TicketEquipmentCard'
import TicketHeader from '../components/TicketHeader'
import TicketProgress from '../components/TicketProgress'
import TicketResponsePanel from '../components/TicketResponsePanel'
import TicketSlaCard from '../components/TicketSlaCard'
import { useTicketDetail } from '../hooks/useTicketDetail'
import { formatTicketDateTime } from '../utils/labels'
import { formatSlaCountdown, getSlaRemaining } from '../utils/sla'

export default function TicketDetailView({ ticketId, onBack }) {
  const detail = useTicketDetail(ticketId)
  const [notice, setNotice] = useState('')
  const [confirm, setConfirm] = useState(null)
  const [responseMessage, setResponseMessage] = useState('')
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [now, setNow] = useState(null)
  const responsePanelRef = useRef(null)
  const closeNotice = useCallback(() => setNotice(''), [])

  useEffect(() => {
    const updateClock = () => setNow(Date.now())
    updateClock()
    const timer = window.setInterval(updateClock, 60 * 1000)
    return () => window.clearInterval(timer)
  }, [])

  function openResponsePanel() {
    responsePanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  function handleStatusAction() {
    if (detail.ticket?.status === 'pending') {
      detail.clearActionError()
      setConfirm({ status: 'in_analysis', responseMessage: '' })
      return
    }

    openResponsePanel()
  }

  function handleResponseChange(event) {
    setResponseMessage(event.target.value)
    if (formError) setFormError('')
  }

  function handleResponseSubmit(event) {
    event.preventDefault()
    if (!responseMessage.trim()) {
      setFormError('Escreva a resposta antes de concluir o pedido.')
      return
    }

    detail.clearActionError()
    setFormError('')
    setConfirm({ status: 'responded', responseMessage })
  }

  async function handleConfirmStatus() {
    if (!confirm) return false

    setSaving(true)
    try {
      const saved = await detail.updateStatus(confirm.status, confirm.responseMessage)
      if (saved) {
        setConfirm(null)
        if (confirm.status === 'responded') setResponseMessage('')
        setNotice(
          confirm.status === 'responded'
            ? 'Resposta registada. O envio ao cliente é manual.'
            : 'Pedido colocado em análise.',
        )
      }
      return saved
    } finally {
      setSaving(false)
    }
  }

  if (detail.loading) return <LoadingSpinner label="A carregar detalhe do pedido..." />

  if (detail.error || !detail.ticket) {
    return (
      <div className="space-y-4">
        <button type="button" onClick={onBack} className={SECONDARY_BUTTON}>
          Voltar aos pedidos
        </button>
        <ErrorAlert message={detail.error || 'Pedido não encontrado.'} />
        {detail.error && (
          <button type="button" onClick={detail.reload} className={SECONDARY_BUTTON}>
            Tentar novamente
          </button>
        )}
      </div>
    )
  }

  const ticket = detail.ticket
  const remainingMs = now === null ? null : getSlaRemaining(ticket.created_at, now)
  const confirmation =
    confirm?.status === 'responded'
      ? {
          title: 'Registar resposta ao cliente',
          message:
            'A resposta será guardada e o pedido ficará como respondido. O envio por email ou telefone continua a ser manual.',
          confirmLabel: 'Registar resposta',
        }
      : {
          title: 'Iniciar triagem técnica',
          message: 'O estado do pedido será alterado de Pendente para Em Análise.',
          confirmLabel: 'Alterar Estado',
        }

  return (
    <div className="space-y-5 bg-background">
      <TicketHeader
        ticket={ticket}
        onBack={onBack}
        onChangeStatus={handleStatusAction}
        onOpenResponse={openResponsePanel}
      />

      <Notice message={notice} onClose={closeNotice} />
      {detail.actionError && !confirm && ticket.status !== 'in_analysis' && (
        <div className="space-y-2">
          <ErrorAlert message={detail.actionError} onClose={detail.clearActionError} />
          <button type="button" onClick={detail.reload} className={SECONDARY_BUTTON}>
            Atualizar pedido
          </button>
        </div>
      )}

      <TicketProgress ticket={ticket} />

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(18rem,0.9fr)]">
        <main className="min-w-0 space-y-5">
          <TicketSlaCard
            createdAt={ticket.created_at}
            countdown={
              now === null ? 'A calcular prazo...' : formatSlaCountdown(remainingMs)
            }
            now={now}
          />

          <TicketEquipmentCard equipment={ticket.pool?.equipment} />

          <section className={`${CARD_CLASS} p-5`} aria-labelledby="ticket-description-title">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 id="ticket-description-title" className="font-semibold text-slate-800">
                Relato do cliente
              </h2>
              <time className="text-xs text-slate-500">
                Recebido em {formatTicketDateTime(ticket.created_at)}
              </time>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
              {ticket.description || 'O pedido não contém descrição.'}
            </p>
          </section>

          <TicketResponsePanel
            ticket={ticket}
            responseMessage={responseMessage}
            formError={formError}
            actionError={confirm ? '' : detail.actionError}
            saving={saving}
            onChange={handleResponseChange}
            onSubmit={handleResponseSubmit}
            onDismissError={detail.clearActionError}
            onRetry={detail.reload}
            responseFormRef={responsePanelRef}
          />
        </main>

        <aside className="min-w-0 space-y-5" aria-label="Informação do cliente e da piscina">
          <ClientProfileCard
            client={ticket.client}
            activePoolCount={ticket.activePoolCount}
          />
          <PoolSummaryCard pool={ticket.pool} clientId={ticket.client_id} />
          <PoolReadingsCard
            reading={ticket.poolReading}
            thresholds={ticket.alertThresholds}
          />
          <PoolInterventionsPanel
            appointments={ticket.appointments}
            hasMore={ticket.appointmentsHasMore}
            loadingMore={detail.loadingMoreAppointments}
            error={detail.appointmentsError}
            onLoadMore={detail.loadMoreAppointments}
          />
        </aside>
      </div>

      {confirm && (
        <ConfirmDialog
          {...confirmation}
          error={detail.actionError}
          onDismissError={detail.clearActionError}
          onConfirm={handleConfirmStatus}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}
