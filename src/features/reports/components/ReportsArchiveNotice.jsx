import { CARD_CLASS } from '../../../shared/components/uiClasses'

export default function ReportsArchiveNotice() {
  return (
    <aside className={`${CARD_CLASS} flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between`}>
      <div>
        <h2 className="font-semibold text-slate-800">Arquivo digital de intervenções</h2>
        <p className="mt-1 text-sm text-slate-600">
          Os registos apresentados refletem os dados existentes no Firestore; certificação e validação de hash ainda não estão disponíveis.
        </p>
      </div>
      <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
        Normas EN 15288-2 / DGS 005 por validar
      </span>
    </aside>
  )
}
