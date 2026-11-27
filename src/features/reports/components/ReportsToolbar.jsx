import { INPUT_CLASS, SECONDARY_BUTTON } from '../../../shared/components/uiClasses'
import { REPORT_TYPE_OPTIONS } from '../utils/labels'

export default function ReportsToolbar({
  searchTerm,
  onSearchChange,
  type,
  onTypeChange,
  technicianId,
  onTechnicianChange,
  technicians,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  onReset,
}) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 xl:flex-row xl:items-end">
      <div className="min-w-60 flex-1">
        <label htmlFor="reports-search" className="text-sm font-medium text-slate-700">Pesquisar nesta página</label>
        <input
          id="reports-search"
          type="search"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="ID, cliente, piscina ou técnico"
          className={INPUT_CLASS}
        />
      </div>
      <div className="xl:w-52">
        <label htmlFor="reports-type" className="text-sm font-medium text-slate-700">Tipo de intervenção</label>
        <select id="reports-type" value={type} onChange={(event) => onTypeChange(event.target.value)} className={INPUT_CLASS}>
          <option value="all">Todos os tipos</option>
          {REPORT_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
      <div className="xl:w-52">
        <label htmlFor="reports-technician" className="text-sm font-medium text-slate-700">Técnico</label>
        <select
          id="reports-technician"
          value={technicianId}
          onChange={(event) => onTechnicianChange(event.target.value)}
          className={INPUT_CLASS}
        >
          <option value="all">Todos os técnicos</option>
          {technicians.map((technician) => (
            <option key={technician.id} value={technician.id}>{technician.name}</option>
          ))}
        </select>
      </div>
      <div className="xl:w-36">
        <label htmlFor="reports-page-size" className="text-sm font-medium text-slate-700">Linhas por página</label>
        <select
          id="reports-page-size"
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          className={INPUT_CLASS}
        >
          {pageSizeOptions.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
      <button type="button" onClick={onReset} className={SECONDARY_BUTTON}>Repor filtros</button>
    </section>
  )
}
