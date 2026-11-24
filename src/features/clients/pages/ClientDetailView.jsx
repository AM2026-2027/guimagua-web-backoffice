import { useState } from 'react'
import LoadingSpinner from '../../../shared/components/LoadingSpinner'
import ErrorAlert from '../../../shared/components/ErrorAlert'
import { useClientDetail } from '../hooks/useClientDetail'
import { usePoolActivity } from '../hooks/usePoolActivity'
import ClientHeader from '../components/ClientHeader'
import ClientFormModal from '../components/ClientFormModal'
import ConfirmDialog from '../../../shared/components/ConfirmDialog'
import Notice from '../../../shared/components/Notice'
import PoolActivityPanel from '../components/PoolActivityPanel'
import PoolFormModal from '../components/PoolFormModal'
import PoolTabs from '../components/PoolTabs'
import PoolTechnicalCard from '../components/PoolTechnicalCard'
import { CARD_CLASS, LINK_BUTTON, SECONDARY_BUTTON } from '../../../shared/components/uiClasses'
import { poolDisplayName, sortPools } from '../utils/poolForm'

/**
 * Ficha do cliente (`/clients?client=<id>`). O estado vive aqui; os componentes são apresentacionais.
 * As alterações são propagadas à lista através dos callbacks recebidos da ClientsPage.
 */
export default function ClientDetailView({ clientId, notice, onNotice, onClearNotice, onBack, onClientSaved, onPoolSaved, onCountsChange }) {
  const detail = useClientDetail(clientId, { onClientSaved, onPoolSaved, onCountsChange })
  const [selectedPoolId, setSelectedPoolId] = useState(null)
  const [editingClient, setEditingClient] = useState(false)
  // { pool: null } = nova piscina; { pool } = editar.
  const [poolForm, setPoolForm] = useState(null)
  // { type: 'client' } ou { type: 'pool', pool }
  const [confirm, setConfirm] = useState(null)

  // Estado derivado: ordem das piscinas e piscina selecionada (por omissão, a primeira).
  const pools = sortPools(detail.pools)
  const selectedIndex = Math.max(0, pools.findIndex((pool) => pool.id === selectedPoolId))
  const selectedPool = pools[selectedIndex] ?? null
  const activity = usePoolActivity(selectedPool?.id ?? null)
  const activePools = pools.filter((pool) => pool.is_active !== false).length

  function openModal(setter, value) {
    detail.clearActionError()
    setter(value)
  }

  if (detail.loading) return <LoadingSpinner label="A carregar ficha do cliente..." />

  if (detail.error || !detail.client) {
    return (
      <div className="space-y-4">
        <button type="button" onClick={onBack} className={LINK_BUTTON}>
          ← Voltar à lista de clientes
        </button>
        <ErrorAlert message={detail.error || 'Cliente não encontrado.'} />
        <button type="button" onClick={detail.reload} className={SECONDARY_BUTTON}>
          Tentar novamente
        </button>
      </div>
    )
  }

  const client = detail.client
  const clientActive = client.is_active !== false

  async function handleClientSubmit(payload) {
    const ok = await detail.updateClient(payload)
    if (ok) {
      setEditingClient(false)
      onNotice('Dados do cliente guardados.')
    }
    return ok
  }

  async function handlePoolSubmit(payload) {
    const editing = poolForm?.pool
    const ok = editing
      ? await detail.updatePool(editing, payload)
      : await detail.createPool(payload, (pool) => setSelectedPoolId(pool.id))
    if (ok) {
      setPoolForm(null)
      onNotice(editing ? 'Piscina guardada.' : 'Piscina associada com sucesso ao cliente.')
    }
    return ok
  }

  async function handleConfirm() {
    if (!confirm) return false
    const ok =
      confirm.type === 'client'
        ? await detail.setClientActive(!clientActive)
        : await detail.setPoolActive(confirm.pool, confirm.pool.is_active === false)
    if (ok) {
      const label = confirm.type === 'client' ? 'Cliente' : 'Piscina'
      const nowActive = confirm.type === 'client' ? !clientActive : confirm.pool.is_active === false
      onNotice(`${label} ${nowActive ? 'reativad' : 'desativad'}${confirm.type === 'client' ? 'o' : 'a'}.`)
      setConfirm(null)
    }
    return ok
  }

  const confirmCopy = (() => {
    if (!confirm) return null
    if (confirm.type === 'client') {
      return clientActive
        ? {
            title: 'Desativar cliente',
            message: `${client.name} deixa de aparecer como ativo. Os dados, as piscinas e o histórico mantêm-se e o cliente pode ser reativado a qualquer momento.${activePools > 0 ? ` As ${activePools} piscina(s) ativa(s) continuam visíveis na agenda.` : ''}`,
            confirmLabel: 'Desativar',
            danger: true,
          }
        : { title: 'Reativar cliente', message: `${client.name} volta a ficar ativo.`, confirmLabel: 'Reativar', danger: false }
    }
    const poolActive = confirm.pool.is_active !== false
    const name = poolDisplayName(confirm.pool, Math.max(0, pools.findIndex((pool) => pool.id === confirm.pool.id)))
    return poolActive
      ? {
          title: 'Desativar piscina',
          message: `${name} deixa de estar ativa. O histórico de leituras e intervenções mantém-se.`,
          confirmLabel: 'Desativar',
          danger: true,
        }
      : { title: 'Reativar piscina', message: `${name} volta a ficar ativa.`, confirmLabel: 'Reativar', danger: false }
  })()

  return (
    <div className="space-y-6">
      <nav aria-label="Navegação estrutural" className="text-sm text-slate-500">
        <button type="button" onClick={onBack} className={LINK_BUTTON}>
          Clientes
        </button>
        <span aria-hidden="true"> › </span>
        <span className="text-slate-700">{client.name}</span>
      </nav>

      <Notice message={notice} onClose={onClearNotice} />

      <ClientHeader
        client={client}
        activePools={activePools}
        onEdit={() => openModal(setEditingClient, true)}
        onToggleActive={() => openModal(setConfirm, { type: 'client' })}
        onAddPool={() => openModal(setPoolForm, { pool: null })}
      />

      <section aria-labelledby="pools-title" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 id="pools-title" className="text-lg font-semibold text-slate-800">
            Piscinas
          </h2>
          <span className="text-sm text-slate-500">
            {pools.length === 1 ? '1 piscina registada' : `${pools.length} piscinas registadas`}
          </span>
        </div>

        {pools.length === 0 ? (
          <div className={`${CARD_CLASS} p-6 text-center`}>
            <p className="text-sm text-slate-500">Este cliente ainda não tem piscinas associadas.</p>
            {clientActive && (
              <button
                type="button"
                onClick={() => openModal(setPoolForm, { pool: null })}
                className={`${LINK_BUTTON} mt-2`}
              >
                + Adicionar piscina
              </button>
            )}
          </div>
        ) : (
          <>
            <PoolTabs
              pools={pools}
              selectedId={selectedPool?.id}
              onSelect={setSelectedPoolId}
              onAdd={() => openModal(setPoolForm, { pool: null })}
              canAdd={clientActive}
            />
            {selectedPool && (
              <div id="pool-panel" role="tabpanel" aria-labelledby={`pool-tab-${selectedPool.id}`} className="space-y-4">
                <PoolTechnicalCard
                  pool={selectedPool}
                  index={selectedIndex}
                  onEdit={() => openModal(setPoolForm, { pool: selectedPool })}
                  onToggleActive={() => openModal(setConfirm, { type: 'pool', pool: selectedPool })}
                />
                <PoolActivityPanel activity={activity} />
              </div>
            )}
          </>
        )}
      </section>

      {editingClient && (
        <ClientFormModal
          key={client.id}
          client={client}
          serverError={detail.actionError}
          onDismissError={detail.clearActionError}
          onSubmit={handleClientSubmit}
          onClose={() => setEditingClient(false)}
        />
      )}

      {poolForm && (
        <PoolFormModal
          key={poolForm.pool?.id ?? 'new-pool'}
          pool={poolForm.pool}
          defaultAddress={client.address}
          serverError={detail.actionError}
          onDismissError={detail.clearActionError}
          onSubmit={handlePoolSubmit}
          onClose={() => setPoolForm(null)}
        />
      )}

      {confirm && confirmCopy && (
        <ConfirmDialog
          {...confirmCopy}
          error={detail.actionError}
          onDismissError={detail.clearActionError}
          onConfirm={handleConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}
