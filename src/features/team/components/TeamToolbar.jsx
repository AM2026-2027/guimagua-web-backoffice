import { INPUT_CLASS } from '../../../shared/components/uiClasses'
import { TEAM_SORT_OPTIONS } from '../utils/sort'

/** Pesquisa e ordenação da equipa. Os filtros por perfil e estado estão nos cartões de totais (TeamStats). */
export default function TeamToolbar({ searchTerm, onSearchChange, sort, onSortChange }) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
      <div className="flex-1">
        <label htmlFor="team-search" className="text-sm font-medium text-slate-700">
          Pesquisar
        </label>
        <input
          id="team-search"
          type="search"
          placeholder="Nome, nome de utilizador, email ou telemóvel"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          className={INPUT_CLASS}
        />
      </div>

      <div className="lg:w-56">
        <label htmlFor="team-sort" className="text-sm font-medium text-slate-700">
          Ordenar
        </label>
        <select id="team-sort" value={sort} onChange={(event) => onSortChange(event.target.value)} className={INPUT_CLASS}>
          {TEAM_SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
