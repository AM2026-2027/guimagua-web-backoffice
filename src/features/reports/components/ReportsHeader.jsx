import { INPUT_CLASS, PRIMARY_BUTTON, SECONDARY_BUTTON } from '../../../shared/components/uiClasses'

export default function ReportsHeader({
  period,
  onPeriodChange,
  onExport,
  exportDisabled,
}) {
  return (
    <header className="flex flex-col gap-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Módulo de auditoria &amp; registo</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-800">Relatórios Técnicos &amp; Histórico Operacional</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">
          Arquivo de intervenções concluídas e leituras associadas. A data usada no período é a data agendada.
        </p>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <fieldset className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <legend className="mb-1 text-sm font-medium text-slate-700">Período (predefinição: últimos 30 dias)</legend>
          <div>
            <label htmlFor="reports-start-date" className="text-xs text-slate-500">Desde</label>
            <input
              id="reports-start-date"
              type="date"
              required
              value={period.startDate}
              onChange={(event) => onPeriodChange({ ...period, startDate: event.target.value })}
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label htmlFor="reports-end-date" className="text-xs text-slate-500">Até</label>
            <input
              id="reports-end-date"
              type="date"
              required
              value={period.endDate}
              onChange={(event) => onPeriodChange({ ...period, endDate: event.target.value })}
              className={INPUT_CLASS}
            />
          </div>
        </fieldset>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onExport} disabled={exportDisabled} className={PRIMARY_BUTTON}>
            Exportar página (CSV)
          </button>
          <button type="button" disabled className={SECONDARY_BUTTON}>
            Gerar relatório pericial — fase seguinte
          </button>
        </div>
      </div>
    </header>
  )
}
