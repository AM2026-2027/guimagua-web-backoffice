import { useSearchParams } from 'react-router'
import ErrorAlert from '../../../shared/components/ErrorAlert'
import { useReferenceData } from '../hooks/useReferenceData'
import ReportsTabs from '../components/ReportsTabs'
import InterventionsPanel from './InterventionsPanel'
import RoutesPanel from './RoutesPanel'
import StockMovementsPanel from './StockMovementsPanel'
import { REPORT_TABS } from '../utils/labels'

const TAB_VALUES = new Set(REPORT_TABS.map((tab) => tab.value))

/**
 * Relatórios & Histórico (RF-WEB07, US10): intervenções, rotas da equipa e movimentos de stock.
 * O separador ativo e o filtro de piscina vivem no endereço (`?tab=` e `?pool=`), sem rota nova.
 * Módulo só de leitura: não grava nada no Firestore.
 */
export default function ReportsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const requested = searchParams.get('tab')
  const tab = TAB_VALUES.has(requested) ? requested : 'interventions'
  const poolId = searchParams.get('pool')
  const reference = useReferenceData()

  function changeTab(value) {
    const next = new URLSearchParams(searchParams)
    next.set('tab', value)
    setSearchParams(next)
  }

  function clearPool() {
    const next = new URLSearchParams(searchParams)
    next.delete('pool')
    setSearchParams(next)
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Auditoria e histórico</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-800">Relatórios & Histórico</h1>
        <p className="mt-1 text-sm text-slate-500">Intervenções realizadas, rotas diárias da equipa e movimentos de stock, com exportação para CSV.</p>
      </div>

      <ReportsTabs active={tab} onChange={changeTab} />
      <ErrorAlert message={reference.error} />

      <div id="reports-panel" role="tabpanel" aria-labelledby={`reports-tab-${tab}`}>
        {tab === 'interventions' && <InterventionsPanel reference={reference} poolId={poolId} onClearPool={clearPool} />}
        {tab === 'routes' && <RoutesPanel reference={reference} />}
        {tab === 'stock' && <StockMovementsPanel reference={reference} />}
      </div>
    </div>
  )
}
