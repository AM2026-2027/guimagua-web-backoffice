import { INPUT_CLASS } from '../../../shared/components/uiClasses'
import { CATEGORY_OPTIONS } from '../utils/labels'

export default function InventoryToolbar({
  searchTerm,
  onSearchChange,
  category,
  onCategoryChange,
  showInactive,
  onShowInactiveChange,
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
      <div className="flex-1">
        <label htmlFor="inventory-search" className="text-sm font-medium text-slate-700">
          Pesquisar
        </label>
        <input
          id="inventory-search"
          type="search"
          placeholder="Nome, SKU (ex.: QUI-0001), fornecedor ou descrição"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          className={INPUT_CLASS}
        />
      </div>
      <div className="lg:w-64">
        <label htmlFor="inventory-category" className="text-sm font-medium text-slate-700">
          Categoria
        </label>
        <select id="inventory-category" value={category} onChange={(event) => onCategoryChange(event.target.value)} className={INPUT_CLASS}>
          <option value="all">Todas as categorias</option>
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-wrap items-center gap-4 pb-2">
        {/* US03: os artigos inativos têm de estar sempre acessíveis, para evitar inativações acidentais. */}
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(event) => onShowInactiveChange(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 accent-primary"
          />
          Ver artigos inativos
        </label>
      </div>
    </div>
  )
}
