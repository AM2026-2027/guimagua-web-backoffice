import { INPUT_CLASS } from '../../../shared/components/uiClasses'

/** Pesquisa da equipa. Os filtros por perfil e estado estão nos cartões de totais (TeamStats). */
export default function TeamToolbar({ searchTerm, onSearchChange }) {
  return (
    <div>
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
  )
}
