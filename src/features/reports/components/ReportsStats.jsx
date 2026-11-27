import { CARD_CLASS } from '../../../shared/components/uiClasses'

const COUNT_FORMAT = new Intl.NumberFormat('pt-PT')

function StatCard({ label, value, hint }) {
  return (
    <article className={`${CARD_CLASS} p-5`}>
      <h2 className="text-sm font-medium text-slate-500">{label}</h2>
      <p className="mt-2 text-3xl font-semibold text-slate-800">
        {value == null ? '—' : COUNT_FORMAT.format(value)}
      </p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </article>
  )
}

export default function ReportsStats({ counts, loading }) {
  const values = loading ? null : counts
  return (
    <section aria-label="Estatísticas do período" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <StatCard
        label="Intervenções concluídas"
        value={values?.completed}
        hint="No período selecionado"
      />
      <StatCard
        label="PDF disponíveis"
        value={values?.pdfAvailable}
        hint="Com caminho registado no Storage"
      />
      <StatCard
        label="Leituras físico-químicas"
        value={values?.readings}
        hint="Registadas no período"
      />
    </section>
  )
}
