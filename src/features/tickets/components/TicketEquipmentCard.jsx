import { CARD_CLASS } from '../../../shared/components/uiClasses'

export default function TicketEquipmentCard({ equipment }) {
  const items = Array.isArray(equipment) ? equipment.filter(Boolean) : []

  return (
    <section className={`${CARD_CLASS} p-5`} aria-labelledby="ticket-equipment-title">
      <h2 id="ticket-equipment-title" className="text-lg font-semibold text-slate-800">
        Equipamento registado
      </h2>
      {items.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-2">
          {items.map((item, index) => (
            <li
              key={`${item}-${index}`}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
            >
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-slate-500">Não há equipamento registado para esta piscina.</p>
      )}
      <p className="mt-3 text-xs text-slate-500">
        Referência, número de série, instalação e garantia não constam do registo disponível.
      </p>
    </section>
  )
}
