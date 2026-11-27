import { SECONDARY_BUTTON } from '../../../shared/components/uiClasses'

export default function ReportsPagination({
  pageNumber,
  totalPages,
  pageItemCount,
  totalCount,
  searchActive,
  hasPreviousPage,
  hasNextPage,
  loadingMore,
  onPrevious,
  onNext,
}) {
  const start = totalCount === 0 ? 0 : (pageNumber - 1) * pageItemCount + 1
  const end = (pageNumber - 1) * pageItemCount + pageItemCount

  return (
    <nav aria-label="Paginação das intervenções" className="flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
      <p aria-live="polite">
        {searchActive
          ? `${pageItemCount} intervenções nesta página; ${totalCount ?? '—'} concluídas no período`
          : `A mostrar ${start} a ${end} de ${totalCount ?? '—'} intervenções concluídas`}
        {totalPages > 0 && ` · Página ${pageNumber} de ${totalPages}`}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onPrevious}
          disabled={!hasPreviousPage || loadingMore}
          className={SECONDARY_BUTTON}
        >
          Anterior
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!hasNextPage || loadingMore}
          className={SECONDARY_BUTTON}
        >
          {loadingMore ? 'A carregar…' : 'Seguinte'}
        </button>
      </div>
    </nav>
  )
}
