import { useState } from 'react'
import LoadingSpinner from '../../../shared/components/LoadingSpinner'
import ErrorAlert from '../../../shared/components/ErrorAlert'
import { CARD_CLASS, INPUT_CLASS, SECONDARY_BUTTON } from '../../../shared/components/uiClasses'
import { useInterventionsHistory } from '../hooks/useInterventionsHistory'
import { useInterventionDetail } from '../hooks/useInterventionDetail'
import ExportCsvButton from '../components/ExportCsvButton'
import InterventionDetail from '../components/InterventionDetail'
import InterventionsTable from '../components/InterventionsTable'
import PeriodFields from '../components/PeriodFields'
import { csvFileName } from '../utils/csv'
import { rangeFromInputs, shiftInputDate, todayInput } from '../utils/dates'
import { INTERVENTION_CSV_COLUMNS, matchesIntervention } from '../utils/interventions'

/**
 * Separador "Intervenções" (RF-WEB07, US10): histórico paginado com filtros no servidor (período, técnico,
 * canceladas e piscina) e pesquisa local nas páginas carregadas. `poolId` vem de `?pool=` (ligação futura do `clients`).
 */
export default function InterventionsPanel({ reference, poolId, onClearPool }) {
  const [period, setPeriod] = useState({ from: '', to: '' })
  const [techId, setTechId] = useState('')
  const [includeCancelled, setIncludeCancelled] = useState(false)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  const { startMs, endMs } = rangeFromInputs(period.from, period.to)
  const history = useInterventionsHistory({ includeCancelled, startMs, endMs, techId: techId || null, poolId: poolId || null }, reference)
  const detail = useInterventionDetail(selected)

  // Estado derivado: pesquisa local sobre as páginas carregadas.
  const visibleRows = history.rows.filter((row) => matchesIntervention(row, search))
  const poolName = poolId ? history.pools.get(poolId)?.name || history.pools.get(poolId)?.local_address || poolId : null

  function quickPeriod(days) {
    const today = todayInput(Date.now())
    setPeriod({ from: shiftInputDate(today, -(days - 1)), to: today })
  }

  return (
    <div className="space-y-4">
      <div className={`${CARD_CLASS} space-y-4 p-4`}>
        <PeriodFields idPrefix="interventions" from={period.from} to={period.to} onChange={setPeriod} onQuick={quickPeriod} />
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="lg:w-64">
            <label htmlFor="interventions-tech" className="text-sm font-medium text-slate-700">
              Técnico
            </label>
            <select id="interventions-tech" value={techId} onChange={(event) => setTechId(event.target.value)} className={INPUT_CLASS}>
              <option value="">Todos os técnicos</option>
              {reference.technicians.map((tech) => (
                <option key={tech.id} value={tech.id}>
                  {tech.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label htmlFor="interventions-search" className="text-sm font-medium text-slate-700">
              Pesquisar nos resultados
            </label>
            <input
              id="interventions-search"
              type="search"
              placeholder="Cliente, piscina, técnico, serviço ou notas"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className={INPUT_CLASS}
            />
          </div>
          <label className="flex items-center gap-2 pb-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={includeCancelled}
              onChange={(event) => setIncludeCancelled(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 accent-primary"
            />
            Incluir canceladas
          </label>
          <div className="pb-0.5">
            <ExportCsvButton rows={visibleRows} columns={INTERVENTION_CSV_COLUMNS} fileName={csvFileName('relatorio-intervencoes', period.to || period.from)} />
          </div>
        </div>
        {poolId && (
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <span>
              A mostrar só a piscina <strong>{poolName}</strong>.
            </span>
            <button type="button" onClick={onClearPool} className="font-medium text-primary hover:underline">
              Ver todas
            </button>
          </div>
        )}
      </div>

      {history.loading ? (
        <LoadingSpinner label="A carregar histórico..." />
      ) : history.error ? (
        <div className="space-y-3">
          <ErrorAlert message={history.error} />
          <button type="button" onClick={history.reload} className={SECONDARY_BUTTON}>
            Tentar novamente
          </button>
        </div>
      ) : visibleRows.length === 0 ? (
        <div className={`${CARD_CLASS} p-8 text-center text-sm text-slate-500`}>
          {history.rows.length === 0 ? 'Não há intervenções com estes filtros.' : 'Nenhuma intervenção carregada corresponde à pesquisa.'}
        </div>
      ) : (
        <InterventionsTable rows={visibleRows} onOpen={setSelected} />
      )}

      <ErrorAlert message={history.moreError} />
      {!history.loading && !history.error && (
        <div className="flex flex-col items-center gap-2 text-sm text-slate-500 sm:flex-row sm:justify-between">
          <span>
            {visibleRows.length} de {history.rows.length} intervenç{history.rows.length === 1 ? 'ão carregada' : 'ões carregadas'}
          </span>
          {history.hasMore && (
            <button type="button" onClick={history.loadMore} disabled={history.loadingMore} className={SECONDARY_BUTTON}>
              {history.loadingMore ? 'A carregar...' : 'Carregar mais'}
            </button>
          )}
        </div>
      )}

      {selected && <InterventionDetail key={selected.id} intervention={selected} detail={detail} onClose={() => setSelected(null)} />}
    </div>
  )
}
