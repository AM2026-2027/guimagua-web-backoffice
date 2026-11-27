import { INPUT_CLASS, LINK_BUTTON } from '../../../shared/components/uiClasses'

/** Campos "de"/"até" (datas em Lisboa) com atalhos de período. `onQuick(days)` é tratado pela página. */
export default function PeriodFields({ idPrefix, from, to, onChange, onQuick }) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <label htmlFor={`${idPrefix}-from`} className="text-sm font-medium text-slate-700">
          De
        </label>
        <input
          id={`${idPrefix}-from`}
          type="date"
          value={from}
          max={to || undefined}
          onChange={(event) => onChange({ from: event.target.value, to })}
          className={INPUT_CLASS}
        />
      </div>
      <div>
        <label htmlFor={`${idPrefix}-to`} className="text-sm font-medium text-slate-700">
          Até
        </label>
        <input
          id={`${idPrefix}-to`}
          type="date"
          value={to}
          min={from || undefined}
          onChange={(event) => onChange({ from, to: event.target.value })}
          className={INPUT_CLASS}
        />
      </div>
      <div className="flex gap-3 pb-2 text-sm">
        <button type="button" onClick={() => onQuick(7)} className={LINK_BUTTON}>
          7 dias
        </button>
        <button type="button" onClick={() => onQuick(30)} className={LINK_BUTTON}>
          30 dias
        </button>
        <button type="button" onClick={() => onChange({ from: '', to: '' })} className={LINK_BUTTON}>
          Todo o histórico
        </button>
      </div>
    </div>
  )
}
