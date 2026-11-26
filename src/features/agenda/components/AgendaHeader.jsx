import { PRIMARY_BUTTON, SECONDARY_BUTTON } from '../../../shared/components/uiClasses'
import AgendaViewTabs from './AgendaViewTabs'

export default function AgendaHeader({
  onPrint,
  onCreate,
  createDisabled,
  view,
  dateKey,
  monthKey,
  todayKey,
  onDayNavigate,
  onMonthNavigate,
}) {
  const selectedMonth = view === 'day' ? dateKey.slice(0, 7) : monthKey

  return (
    <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Gestão operacional</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-800">
          {view === 'day' ? 'Planeamento Diário de Intervenções' : 'Planeamento Mensal de Intervenções'}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {view === 'day'
            ? 'Agenda do dia, equipa e intervenções registadas no sistema.'
            : 'Grelha mensal de intervenções registadas no sistema.'}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2 print:hidden">
        <AgendaViewTabs
          view={view}
          dayDateKey={view === 'day' ? dateKey : todayKey}
          monthKey={selectedMonth}
          onDayNavigate={onDayNavigate}
          onMonthNavigate={onMonthNavigate}
        />
        {view === 'day' && (
          <button type="button" onClick={onPrint} className={SECONDARY_BUTTON}>
            Imprimir escala
          </button>
        )}
        <button type="button" onClick={onCreate} disabled={createDisabled} className={PRIMARY_BUTTON}>
          <span aria-hidden="true">+</span> Agendar intervenção
        </button>
      </div>
    </header>
  )
}
