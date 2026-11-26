import { INPUT_CLASS } from '../../../shared/components/uiClasses'
import { ROLE_FILTERS, STATUS_FILTERS } from '../utils/labels'

export default function TeamToolbar({ searchTerm, onSearchChange, role, onRoleChange, status, onStatusChange }) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
      <div className="flex-1">
        <label htmlFor="team-search" className="text-sm font-medium text-slate-700">
          Pesquisar
        </label>
        <input
          id="team-search"
          type="search"
          placeholder="Nome, email ou telemóvel"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          className={INPUT_CLASS}
        />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:w-96">
        <div>
          <label htmlFor="team-role" className="text-sm font-medium text-slate-700">
            Perfil
          </label>
          <select id="team-role" value={role} onChange={(event) => onRoleChange(event.target.value)} className={INPUT_CLASS}>
            {ROLE_FILTERS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="team-status" className="text-sm font-medium text-slate-700">
            Estado
          </label>
          <select id="team-status" value={status} onChange={(event) => onStatusChange(event.target.value)} className={INPUT_CLASS}>
            {STATUS_FILTERS.map((option) => (
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
