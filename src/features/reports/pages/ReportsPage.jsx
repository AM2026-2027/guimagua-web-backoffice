import { useCallback, useState } from 'react'
import ErrorAlert from '../../../shared/components/ErrorAlert'
import LoadingSpinner from '../../../shared/components/LoadingSpinner'
import Notice from '../../../shared/components/Notice'
import { CARD_CLASS, SECONDARY_BUTTON } from '../../../shared/components/uiClasses'
import { useReports } from '../hooks/useReports'
import ReportsArchiveNotice from '../components/ReportsArchiveNotice'
import ReportsHeader from '../components/ReportsHeader'
import ReportsPagination from '../components/ReportsPagination'
import ReportsStats from '../components/ReportsStats'
import ReportsTable from '../components/ReportsTable'
import ReportsToolbar from '../components/ReportsToolbar'
import { formatReportDateTime, isValidReportPeriod } from '../utils/dateRange'
import { reportsToCsv } from '../utils/csv'

export default function ReportsPage() {
  const reports = useReports()
  const [notice, setNotice] = useState('')
  const clearNotice = useCallback(() => setNotice(''), [])

  function handleExport() {
    if (reports.visibleReports.length === 0) return
    const csv = reportsToCsv(reports.visibleReports, formatReportDateTime)
    const file = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = url
    link.download = 'intervencoes-concluidas.csv'
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
    setNotice('A página atual foi exportada em CSV.')
  }

  const invalidPeriod = !isValidReportPeriod(reports.period)
  const hasSearch = reports.searchTerm.trim().length > 0

  return (
    <div className="space-y-6">
      <ReportsHeader
        period={reports.period}
        onPeriodChange={reports.setPeriod}
        onExport={handleExport}
        exportDisabled={reports.loading || reports.visibleReports.length === 0}
      />

      <Notice message={notice} onClose={clearNotice} />
      {invalidPeriod && <ErrorAlert message="O início do período tem de ser anterior ou igual ao fim." />}
      <ErrorAlert message={reports.summaryError} />
      <ReportsStats counts={reports.counts} loading={reports.summaryLoading} />

      <ReportsToolbar
        searchTerm={reports.searchTerm}
        onSearchChange={reports.setSearchTerm}
        type={reports.type}
        onTypeChange={reports.setType}
        technicianId={reports.technicianId}
        onTechnicianChange={reports.setTechnicianId}
        technicians={reports.technicians}
        pageSize={reports.pageSize}
        pageSizeOptions={reports.pageSizeOptions}
        onPageSizeChange={reports.setPageSize}
        onReset={reports.resetFilters}
      />

      <ErrorAlert message={reports.error} />
      {(reports.error || reports.summaryError) && (
        <button type="button" onClick={reports.reload} className={SECONDARY_BUTTON}>
          Tentar novamente
        </button>
      )}

      {invalidPeriod && (
        <div className={`${CARD_CLASS} p-6 text-sm text-slate-600`} role="status">
          Corrija o intervalo para carregar os dados.
        </div>
      )}
      {!invalidPeriod && !reports.error && reports.loading && (
        <LoadingSpinner label="A carregar intervenções..." />
      )}
      {!invalidPeriod && !reports.error && !reports.loading && reports.visibleReports.length === 0 && (
        <div className={`${CARD_CLASS} p-8 text-center text-sm text-slate-600`} role="status">
          {hasSearch
            ? 'Nenhuma intervenção nesta página corresponde à pesquisa.'
            : 'Não há intervenções concluídas para os filtros selecionados.'}
        </div>
      )}
      {!invalidPeriod && !reports.error && !reports.loading && reports.visibleReports.length > 0 && (
        <ReportsTable reports={reports.visibleReports} />
      )}

      {!invalidPeriod && !reports.loading && !reports.error && reports.pageItemCount > 0 && (
        <ReportsPagination
          pageNumber={reports.pageNumber}
          totalPages={reports.totalPages}
          pageItemCount={reports.pageItemCount}
          totalCount={reports.totalCount}
          searchActive={hasSearch}
          hasPreviousPage={reports.hasPreviousPage}
          hasNextPage={reports.hasNextPage}
          loadingMore={reports.loadingMore}
          onPrevious={reports.loadPreviousPage}
          onNext={reports.loadNextPage}
        />
      )}
      <ReportsArchiveNotice />
    </div>
  )
}
