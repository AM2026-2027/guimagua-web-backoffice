import FormField from '../../../shared/components/FormField'
import { INPUT_CLASS, INPUT_ERROR_CLASS, LINK_BUTTON } from '../../../shared/components/uiClasses'

function poolLabel(pool) {
  return [pool.name, pool.local_address].filter(Boolean).join(' — ') || `Piscina ${pool.id}`
}

/**
 * Escolha do cliente (pesquisa por nome ou email) e da piscina desse cliente.
 * Apresentacional: a pesquisa e as piscinas chegam por props a partir dos hooks do formulário.
 */
export default function ClientPoolPicker({
  searchTerm,
  onSearchChange,
  search,
  selectedClient,
  onSelectClient,
  onClearClient,
  pools,
  poolsLoading,
  poolsError,
  poolId,
  onChange,
  errors,
  disabled,
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {selectedClient ? (
        <div>
          <p className="text-sm font-medium text-slate-700">
            Cliente <span className="text-red-600" aria-hidden="true">*</span>
          </p>
          <div className="mt-1 flex items-center justify-between gap-2 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2">
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-slate-800">{selectedClient.name}</span>
              <span className="block truncate text-xs text-slate-500">{selectedClient.email}</span>
            </span>
            <button type="button" onClick={onClearClient} disabled={disabled} className={LINK_BUTTON}>
              Alterar
            </button>
          </div>
        </div>
      ) : (
        <FormField
          id="appointment-client-search"
          label="Cliente"
          required
          error={errors.client_id}
          hint="Escreva pelo menos 2 letras do nome ou o início do email."
        >
          {(fieldProps) => (
            <div>
              <input
                {...fieldProps}
                type="search"
                value={searchTerm}
                onChange={(event) => onSearchChange(event.target.value)}
                autoComplete="off"
                placeholder="Pesquisar cliente..."
                disabled={disabled}
                className={`${INPUT_CLASS} ${errors.client_id ? INPUT_ERROR_CLASS : ''}`}
              />
              {!search.tooShort && (
                <div className="mt-1 rounded-lg border border-slate-200 bg-white" aria-live="polite">
                  {search.searching ? (
                    <p className="px-3 py-2 text-xs text-slate-500">A pesquisar...</p>
                  ) : search.error ? (
                    <p className="px-3 py-2 text-xs text-red-600">{search.error}</p>
                  ) : search.clients.length === 0 ? (
                    <p className="px-3 py-2 text-xs text-slate-500">Nenhum cliente ativo encontrado.</p>
                  ) : (
                    <ul className="max-h-48 overflow-y-auto py-1" aria-label="Clientes encontrados">
                      {search.clients.map((client) => (
                        <li key={client.id}>
                          <button
                            type="button"
                            onClick={() => onSelectClient(client)}
                            className="w-full px-3 py-2 text-left hover:bg-background focus:bg-background focus:outline-none"
                          >
                            <span className="block text-sm font-medium text-slate-800">{client.name}</span>
                            <span className="block text-xs text-slate-500">{client.email}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}
        </FormField>
      )}

      <FormField id="appointment-pool" label="Piscina" required error={errors.pool_id || poolsError}>
        {(fieldProps) => (
          <select
            {...fieldProps}
            name="pool_id"
            value={poolId}
            onChange={onChange}
            disabled={disabled || !selectedClient || poolsLoading}
            className={`${INPUT_CLASS} ${errors.pool_id ? INPUT_ERROR_CLASS : ''}`}
          >
            <option value="">
              {!selectedClient
                ? 'Escolha primeiro o cliente'
                : poolsLoading
                  ? 'A carregar piscinas...'
                  : pools.length === 0
                    ? 'Cliente sem piscinas ativas'
                    : 'Selecione a piscina'}
            </option>
            {pools.map((pool) => (
              <option key={pool.id} value={pool.id}>
                {poolLabel(pool)}
              </option>
            ))}
          </select>
        )}
      </FormField>
    </div>
  )
}
