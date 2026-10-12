"use client";

import { formatWeight, type Unit } from "@/domain/units";
import { plural } from "@/lib/format";
import { cx } from "@/lib/cx";
import { Card, CardBody, CardHeader } from "@/ui/Card";
import { useWeightUnit } from "./use-weight-unit";

const UNITS: { value: Unit; label: string }[] = [
  { value: "lb", label: "Libras" },
  { value: "kg", label: "Kilos" },
];

// Cambia entre libras y kilos sin salir de la tarjeta.
function UnitToggle({ unit, onChange }: { unit: Unit; onChange: (unit: Unit) => void }) {
  return (
    <div role="group" aria-label="Unidad" className="inline-flex rounded-md border border-linea-fuerte bg-hoja p-0.5">
      {UNITS.map((u) => (
        <button
          key={u.value}
          type="button"
          aria-pressed={unit === u.value}
          onClick={() => onChange(u.value)}
          className={cx(
            "presionable flex h-10 items-center rounded-sm px-3 text-sm font-medium whitespace-nowrap md:h-8",
            unit === u.value
              ? "bg-acento-suave text-acento ring-1 ring-inset ring-acento/40"
              : "text-tinta-2 hover:bg-hoja-2 hover:text-tinta"
          )}
        >
          {u.label}
        </button>
      ))}
    </div>
  );
}

// Cuánto queso se vendió en la semana (pedidos vigentes, pendientes y entregados).
// Los pedidos por valor ($) ya traen sus kg calculados. Se muestra en unidades
// enteras + gramos ("90 lb 380 g") y debajo el equivalente en la otra unidad.
export function WeeklyKgCard({ kg, orders }: { kg: number; orders: number }) {
  const [unit, setUnit] = useWeightUnit();
  const other: Unit = unit === "lb" ? "kg" : "lb";

  return (
    <Card>
      <CardHeader
        title="Queso vendido"
        subtitle="Esta semana, pedidos pendientes y entregados"
        action={<UnitToggle unit={unit} onChange={setUnit} />}
      />
      <CardBody>
        {orders === 0 ? (
          <p className="text-sm text-tinta-2">Aún no hay pedidos esta semana.</p>
        ) : (
          <>
            <p className="num font-display text-[1.75rem] font-semibold leading-tight text-tinta">{formatWeight(kg, unit)}</p>
            <p className="num mt-1 text-sm text-tinta-2">
              = {formatWeight(kg, other)} · {plural(orders, "pedido")}
            </p>
          </>
        )}
      </CardBody>
    </Card>
  );
}
