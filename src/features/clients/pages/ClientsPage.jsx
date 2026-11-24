import { useCallback, useState } from 'react'
import { useSearchParams } from 'react-router'
import LoadingSpinner from '../../../shared/components/LoadingSpinner'
import ErrorAlert from '../../../shared/components/ErrorAlert'
import { useClients } from '../hooks/useClients'
import ClientDetailView from './ClientDetailView'
import ClientFormModal from '../components/ClientFormModal'
import ClientsStats from '../components/ClientsStats'
import ClientsTable from '../components/ClientsTable'
import ClientsToolbar from '../components/ClientsToolbar'
import ConfirmDialog from '../../../shared/components/ConfirmDialog'
import Notice from '../../../shared/components/Notice'
import { CARD_CLASS, PRIMARY_BUTTON, SECONDARY_BUTTON } from '../../../shared/components/uiClasses'
import { sortClients } from '../utils/sort'

/**
 * Clientes & Piscinas (RF-WEB01). Sem rota nova: a ficha abre em `/clients?client=<id>`,
 * o que permite partilhar o link e usar os botões do browser sem alterar o App.jsx (ficheiro partilhado).
 */
export default function ClientsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const clientId = searchParams.get('client')
  const [notice, setNotice] = useState('')
  const clearNotice = useCallback(() => setNotice(''), [])

  const list = useClients({
    // US01: depois de criar, notificação de sucesso e redireção para a ficha do cliente.
    onClientCreated: (client) => {
      setNotice(`Cliente ${client.name} criado com sucesso.`)
      setSearchParams({ client: client.id })
    },
  })

  const [sort, setSort] = useState('recent')
  // { client: null } = novo cliente; { client } = editar.
  const [formTarget, setFormTarget] = useState(null)
  const [confirmTarget, setConfirmTarget] = useState(null)

  if (clientId) {
    return (
      <ClientDetailView
        key={clientId}
        clientId={clientId}
        notice={notice}
        onNotice={setNotice}
        onClearNotice={clearNotice}
        onBack={() => setSearchParams({})}
        onClientSaved={list.upsertClient}
        onPoolSaved={list.upsertPool}
        onCountsChange={list.adjustCounts}
      />
    )
  }

  // Ordenação calculada na renderização, sobre uma cópia.
  const visibleClients = sortClients(list.clients, sort)

  function openForm(target) {
    list.clearActionError()
    setFormTarget(target)
  }

  async function handleSubmit(payload) {
    const editing = formTarget?.client
    const ok = editing ? await list.updateClient(editing, payload) : await list.createClient(payload)
    if (ok) {
      setFormTarget(null)
      if (editing) setNotice('Dados do cliente guardados.')
    }
    return ok
  }

  async function handleConfirm() {
    const client = confirmTarget
    const activate = client.is_active === false
    const ok = await list.setClientActive(client, activate)
    if (ok) {
      setConfirmTarget(null)
      setNotice(`Cliente ${client.name} ${activate ? 'reativado' : 'desativado'}.`)
    }
    return ok
  }

  const searchActive = list.searchTerm.trim().length > 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Diretório de piscinas</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-800">Gestão de Clientes & Piscinas</h1>
          <p className="mt-1 text-sm text-slate-500">Registo de clientes, contactos e características técnicas das piscinas.</p>
        </div>
        <button type="button" onClick={() => openForm({ client: null })} className={PRIMARY_BUTTON}>
          + Novo cliente
        </button>
      </div>

      <Notice message={notice} onClose={clearNotice} />

      <ClientsStats counts={list.counts} />

      <ClientsToolbar
        searchTerm={list.searchTerm}
        onSearchChange={list.setSearchTerm}
        searching={list.searching}
        status={list.status}
        onStatusChange={list.changeStatus}
        sort={sort}
        onSortChange={setSort}
      />

      {!formTarget && !confirmTarget && <ErrorAlert message={list.actionError} onClose={list.clearActionError} />}
      <ErrorAlert message={list.searchError} />

      {list.loading ? (
        <LoadingSpinner label="A carregar clientes..." />
      ) : list.error ? (
        <div className="space-y-3">
          <ErrorAlert message={list.error} />
          <button type="button" onClick={list.reload} className={SECONDARY_BUTTON}>
            Tentar novamente
          </button>
        </div>
      ) : visibleClients.length === 0 ? (
        <div className={`${CARD_CLASS} p-8 text-center text-sm text-slate-500`}>
          {searchActive
            ? list.searching
              ? 'A pesquisar...'
              : 'Nenhum cliente corresponde à pesquisa.'
            : 'Ainda não há clientes registados com este filtro.'}
        </div>
      ) : (
        <>
          <ClientsTable
            clients={visibleClients}
            poolsByClient={list.poolsByClient}
            onEdit={(client) => openForm({ client })}
            onToggleActive={(client) => {
              list.clearActionError()
              setConfirmTarget(client)
            }}
          />
          <div className="flex flex-col items-center gap-2 text-sm text-slate-500 sm:flex-row sm:justify-between">
            <span>
              A mostrar {visibleClients.length} cliente{visibleClients.length === 1 ? '' : 's'}
              {searchActive ? ' (pesquisa)' : ''}
            </span>
            {list.hasMore && (
              <button type="button" onClick={list.loadMore} disabled={list.loadingMore} className={SECONDARY_BUTTON}>
                {list.loadingMore ? 'A carregar...' : 'Carregar mais'}
              </button>
            )}
          </div>
        </>
      )}

      {formTarget && (
        <ClientFormModal
          key={formTarget.client?.id ?? 'new-client'}
          client={formTarget.client}
          serverError={list.actionError}
          onDismissError={list.clearActionError}
          onSubmit={handleSubmit}
          onClose={() => setFormTarget(null)}
        />
      )}

      {confirmTarget && (
        <ConfirmDialog
          title={confirmTarget.is_active === false ? 'Reativar cliente' : 'Desativar cliente'}
          message={
            confirmTarget.is_active === false
              ? `${confirmTarget.name} volta a ficar ativo.`
              : `${confirmTarget.name} deixa de aparecer como ativo. Os dados, as piscinas e o histórico mantêm-se e o cliente pode ser reativado a qualquer momento.`
          }
          confirmLabel={confirmTarget.is_active === false ? 'Reativar' : 'Desativar'}
          danger={confirmTarget.is_active !== false}
          error={list.actionError}
          onDismissError={list.clearActionError}
          onConfirm={handleConfirm}
          onCancel={() => setConfirmTarget(null)}
        />
      )}
    </div>
  )
}
