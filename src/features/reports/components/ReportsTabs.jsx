import { REPORT_TABS } from '../utils/labels'

/** Separadores do módulo (o separador ativo vive em `?tab=` na página). */
export default function ReportsTabs({ active, onChange }) {
  return (
    <div role="tablist" aria-label="Relatórios" className="flex flex-wrap gap-2 border-b border-slate-200">
      {REPORT_TABS.map((tab) => {
        const selected = tab.value === active
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            id={`reports-tab-${tab.value}`}
            aria-selected={selected}
            aria-controls="reports-panel"
            onClick={() => onChange(tab.value)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
              selected ? 'border-primary text-primary' : 'border-transparent text-slate-600 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
