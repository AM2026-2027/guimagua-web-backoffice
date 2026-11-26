import { CARD_CLASS, PRIMARY_BUTTON, SECONDARY_BUTTON } from '../../../shared/components/uiClasses'

export default function AgendaHeader({ onPrint, onCreate, createDisabled }) {
  return (
    <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Gestão operacional</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-800">Planeamento Diário de Intervenções</h1>
        <p className="mt-1 text-sm text-slate-500">
          Agenda do dia, equipa e intervenções registadas no sistema.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2 print:hidden">
        <div className={`${CARD_CLASS} inline-flex items-center gap-1 p-1`} aria-label="Vistas da agenda">
          <span className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white" aria-current="page">
            Dia
          </span>
          <button type="button" disabled className="rounded-lg px-3 py-2 text-sm text-slate-400" aria-label="Vista semanal, indisponível nesta entrega">
            Semana
          </button>
          <button type="button" disabled className="rounded-lg px-3 py-2 text-sm text-slate-400" aria-label="Grelha mensal, indisponível nesta entrega">
            Mês
          </button>
        </div>
        <button type="button" onClick={onPrint} className={SECONDARY_BUTTON}>
          Imprimir escala
        </button>
        <button type="button" onClick={onCreate} disabled={createDisabled} className={PRIMARY_BUTTON}>
          <span aria-hidden="true">+</span> Agendar intervenção
        </button>
      </div>
    </header>
  )
}
