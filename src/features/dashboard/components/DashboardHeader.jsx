import { Link } from 'react-router'
import { PRIMARY_BUTTON, SECONDARY_BUTTON } from '../../../shared/components/uiClasses'
import { formatDateLong, formatDecimal, formatInteger, formatTime } from '../utils/labels'

/**
 * Cabeçalho operacional do Centro de Controlo & Despacho (D-11, RF-WEB05).
 * Substitui a faixa LoRaWAN do protótipo pelo resumo real de monitorização e limiares ativos.
 */
export default function DashboardHeader({
  thresholds,
  hasSavedThresholds,
  activePoolsCount,
  monitoredPoolsCount,
  lastSyncedAt,
  onOpenThresholds,
  onCreateAppointment,
}) {
  return (
    <header className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <span className="text-primary">Operação diária</span>
            <span aria-hidden="true">•</span>
            <span>Hoje, {formatDateLong(new Date())}</span>
            <span aria-hidden="true">•</span>
            <span>Backoffice Guimágua</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-slate-800">Centro de Controlo & Despacho Operacional</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={onOpenThresholds} className={SECONDARY_BUTTON}>
            Configurar limiares
          </button>
          <Link to="/tickets" className={SECONDARY_BUTTON}>
            Triagem de pedidos
          </Link>
          <button type="button" onClick={onCreateAppointment} className={PRIMARY_BUTTON}>
            <span aria-hidden="true">+</span> Agendar intervenção
          </button>
        </div>
      </div>

      <section
        aria-label="Resumo da monitorização físico-química"
        className="flex flex-col gap-3 rounded-2xl bg-primary px-5 py-4 text-white lg:flex-row lg:items-center lg:justify-between"
      >
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
              <path d="M12 3v18M5 8c2-1.5 4.5-1.5 7 0s5 1.5 7 0M5 16c2-1.5 4.5-1.5 7 0s5 1.5 7 0" strokeLinecap="round" />
            </svg>
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
              Monitorização de Leituras {hasSavedThresholds ? '(limiares personalizados)' : '(limiares padrão)'}
            </p>
            <p className="mt-0.5 text-sm font-medium text-white">
              {formatInteger(monitoredPoolsCount)} piscina{monitoredPoolsCount === 1 ? '' : 's'} com leitura recente
              {Number.isFinite(activePoolsCount) ? ` de ${formatInteger(activePoolsCount)} ativas` : ''}
            </p>
          </div>
        </div>

        <dl className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-white/90">
          <div>
            <dt className="text-white/70">pH alvo</dt>
            <dd className="font-semibold">
              {formatDecimal(thresholds.ph_min, 1)} – {formatDecimal(thresholds.ph_max, 1)}
            </dd>
          </div>
          <div>
            <dt className="text-white/70">Cloro alvo</dt>
            <dd className="font-semibold">
              {formatDecimal(thresholds.chlorine_min_ppm, 1)} – {formatDecimal(thresholds.chlorine_max_ppm, 1)} ppm
            </dd>
          </div>
          <div>
            <dt className="text-white/70">Temperatura</dt>
            <dd className="font-semibold">
              {formatDecimal(thresholds.temperature_min_c, 0)} – {formatDecimal(thresholds.temperature_max_c, 0)} °C
            </dd>
          </div>
          <div>
            <dt className="text-white/70">Última atualização</dt>
            <dd className="font-semibold">{lastSyncedAt ? formatTime(lastSyncedAt) : '—'}</dd>
          </div>
        </dl>
      </section>
    </header>
  )
}
