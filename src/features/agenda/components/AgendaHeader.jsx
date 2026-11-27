import { PRIMARY_BUTTON, SECONDARY_BUTTON } from '../../../shared/components/uiClasses'
import AgendaViewTabs from './AgendaViewTabs'

export default function AgendaHeader({
  onPrint,
  onCreate,
  onWeekNavigate,
  createDisabled,
  view,
  dateKey,
  monthKey,
  weekKey,
  todayKey,
}) {
  const selectedMonth =
    view === 'day' ? dateKey.slice(0, 7) : view === 'week' ? weekKey.slice(0, 7) : monthKey
  const dayTabDateKey =
    view === 'day'
      ? dateKey
      : view === 'week'
        ? weekKey
        : monthKey === todayKey.slice(0, 7)
          ? todayKey
          : `${monthKey}-01`
  const title =
    view === 'day'
      ? 'Planeamento Diário de Intervenções'
      : view === 'week'
        ? 'Planeamento Semanal de Intervenções'
        : 'Planeamento Mensal de Intervenções'
  const subtitle =
    view === 'day'
      ? 'Agenda do dia, equipa e intervenções registadas no sistema.'
      : view === 'week'
        ? 'Agenda semanal de técnicos e comerciais, com horários em Europe/Lisbon.'
        : 'Grelha mensal de intervenções registadas no sistema.'

  return (
    <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Gestão operacional</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-800">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2 print:hidden">
        <AgendaViewTabs
          view={view}
          dayDateKey={dayTabDateKey}
          monthKey={selectedMonth}
          weekKey={weekKey}
          onWeekNavigate={onWeekNavigate}
        />
        {view === 'day' && (
          <button type="button" onClick={onPrint} className={SECONDARY_BUTTON}>
            Imprimir escala
          </button>
        )}
        {/* O agendamento está disponível nas três vistas (dia, semana e mês). */}
        <button type="button" onClick={onCreate} disabled={createDisabled} className={PRIMARY_BUTTON}>
          <span aria-hidden="true">+</span> Agendar intervenção
        </button>
      </div>
    </header>
  )
}
