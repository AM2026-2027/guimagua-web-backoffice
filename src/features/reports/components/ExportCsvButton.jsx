import { SECONDARY_BUTTON } from '../../../shared/components/uiClasses'
import { buildCsv } from '../utils/csv'

/** Exporta as linhas visíveis para CSV (descarregado no browser, sem dependências). */
export default function ExportCsvButton({ rows, columns, fileName, label = 'Exportar CSV' }) {
  function handleExport() {
    const url = URL.createObjectURL(new Blob([buildCsv(rows, columns)], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.click()
    // Limpeza: liberta o URL temporário depois de iniciar a descarga.
    setTimeout(() => URL.revokeObjectURL(url), 0)
  }

  return (
    <button type="button" onClick={handleExport} disabled={rows.length === 0} className={SECONDARY_BUTTON}>
      <span aria-hidden="true">⇩</span> {label}
    </button>
  )
}
