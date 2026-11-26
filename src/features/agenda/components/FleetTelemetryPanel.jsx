import { CARD_CLASS } from '../../../shared/components/uiClasses'

export default function FleetTelemetryPanel() {
  return (
    <section className={`${CARD_CLASS} p-5`} aria-labelledby="fleet-telemetry-title">
      <h2 id="fleet-telemetry-title" className="text-base font-semibold text-slate-800">
        Telemetria de frota
      </h2>
      <p className="mt-2 text-sm text-slate-500">
        Não existe integração de GPS, OBD-II ou telemetria de viaturas no modelo atual.
      </p>
    </section>
  )
}
