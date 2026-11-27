/**
 * Gera CSV compatível com o Excel em PT-PT: separador ";", BOM UTF-8 para os acentos e aspas escapadas.
 * `columns`: [{ header, value: (row) => texto }].
 */
export function buildCsv(rows, columns) {
  const escape = (value) => {
    const text = value === null || value === undefined ? '' : String(value)
    return /[";\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
  }
  const lines = [
    columns.map((column) => escape(column.header)).join(';'),
    ...rows.map((row) => columns.map((column) => escape(column.value(row))).join(';')),
  ]
  // BOM UTF-8 no início, para o Excel reconhecer os acentos.
  return `${String.fromCharCode(0xfeff)}${lines.join('\r\n')}`
}

/** Nome de ficheiro seguro, ex.: "relatorio-intervencoes-2026-11-26.csv". */
export function csvFileName(prefix, dateInput) {
  return `${prefix}${dateInput ? `-${dateInput}` : ''}.csv`
}
