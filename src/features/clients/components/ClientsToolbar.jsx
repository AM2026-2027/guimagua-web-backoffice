import { INPUT_CLASS } from './styles'
import { CLIENT_SORT_OPTIONS, CLIENT_STATUS_FILTERS } from '../utils/labels'

export default function ClientsToolbar({ searchTerm, onSearchChange, searching, status, onStatusChange, sort, onSortChange }) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
      <div className="flex-1">
        <label htmlFor="clients-search" className="text-sm font-medium text-slate-700">
          Pesquisar
        </label>
        <div className="relative">
          <input
            id="clients-search"
            type="search"
            placeholder="Nome, email, telefone, NIF, localidade ou n.º de cliente (GP-1082)"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            aria-describedby="clients-search-status"
            className={`${INPUT_CLASS} pr-28`}
          />
          <span
            id="clients-search-status"
            aria-live="polite"
            className="pointer-events-none absolute inset-y-0 right-3 mt-1 flex items-center text-xs text-slate-400"
          >
            {searching ? 'A pesquisar...' : ''}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:w-96">
        <div>
          <label htmlFor="clients-status" className="text-sm font-medium text-slate-700">
            Estado
          </label>
          <select
            id="clients-status"
            value={status}
            onChange={(event) => onStatusChange(event.target.value)}
            className={INPUT_CLASS}
          >
            {CLIENT_STATUS_FILTERS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="clients-sort" className="text-sm font-medium text-slate-700">
            Ordenar
          </label>
          <select id="clients-sort" value={sort} onChange={(event) => onSortChange(event.target.value)} className={INPUT_CLASS}>
            {CLIENT_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
