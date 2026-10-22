"use client";

import { formatWeight, type Unit } from "@/domain/units";
import { formatCOP, plural } from "@/lib/format";
import { cx } from "@/lib/cx";
import { Card, CardHeader } from "@/ui/Card";
import { Money } from "@/ui/Money";
import { SegmentedButtons } from "@/ui/SegmentedButtons";
import { useWeightUnit } from "./use-weight-unit";

const UNITS: { value: Unit; label: string }[] = [
  { value: "lb", label: "Libras" },
  { value: "kg", label: "Kilos" },
];

// Una columna de la tarjeta: separada por una línea fina desde lg, en cuadrícula de 2 en móvil.
function Figure({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cx(
        "flex min-w-0 flex-col gap-0.5 lg:gap-1 lg:border-l lg:border-linea lg:px-6 lg:first:border-l-0 lg:first:pl-0 lg:last:pr-0",
        className
      )}
    >
      <p className="text-xs/4 font-medium text-tinta-3">{label}</p>
      {children}
    </div>
  );
}

const MICRO = "text-[0.6875rem]/[0.875rem] font-medium text-tinta-3";
const VALUE = "num text-xl/6 font-semibold text-tinta lg:text-2xl/7";

// "Esta semana": ganancia, vendido, cobrado y queso vendido. Es de cliente por el selector
// libras/kilos, que se recuerda en el navegador.
export function WeekSummaryCard({
  profit,
  profitDiff,
  revenue,
  orderCount,
  collected,
  collectedPct,
  kgSold,
  notes,
}: {
  profit: number;
  profitDiff: number | null;
  revenue: number;
  orderCount: number;
  collected: number;
  collectedPct: number;
  kgSold: number;
  notes: string[];
}) {
  const [unit, setUnit] = useWeightUnit();
  const other: Unit = unit === "lb" ? "kg" : "lb";
  const pct = Math.min(Math.max(collectedPct, 0), 100);

  return (
    <Card>
      <CardHeader
        title="Esta semana"
        action={<SegmentedButtons label="Unidad de peso" options={UNITS} value={unit} onChange={setUnit} />}
      />
      <div className="flex flex-col gap-4 p-4 md:p-5">
        <div className="grid grid-cols-2 gap-x-3 gap-y-4 lg:grid-cols-4 lg:gap-x-0">
          <Figure label="Ganancia">
            <p className="num text-[2rem]/9 font-semibold tracking-[-0.01em] text-tinta">
              <Money value={profit} tone="auto" />
            </p>
            {profitDiff === null ? (
              <p className={MICRO}>Sin semana anterior para comparar</p>
            ) : (
              <p className={cx("num text-[0.6875rem]/[0.875rem] font-medium", profitDiff >= 0 ? "text-cobrado" : "text-debe")}>
                {profitDiff >= 0 ? "+" : "−"} {formatCOP(Math.abs(profitDiff))} vs semana pasada
              </p>
            )}
          </Figure>

          <Figure label="Vendido">
            <p className={VALUE}>
              <Money value={revenue} />
            </p>
            <p className={MICRO}>{plural(orderCount, "pedido")}</p>
          </Figure>

          <Figure label="Cobrado">
            <p className={VALUE}>
              <Money value={collected} />
            </p>
            <div
              role="progressbar"
              aria-label="Cobrado de lo vendido"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(pct)}
              className="h-1.5 overflow-hidden rounded-[3px] bg-hoja-3"
            >
              <div className="h-full bg-cobrado" style={{ width: `${pct}%` }} />
            </div>
            <p className={MICRO}>{revenue > 0 ? `${Math.round(pct)} % de lo vendido` : "Sin ventas todavía"}</p>
          </Figure>

          <Figure label="Queso vendido">
            <p className={cx(VALUE, "whitespace-nowrap")}>{formatWeight(kgSold, unit)}</p>
            <p className={cx(MICRO, "num")}>{formatWeight(kgSold, other)}</p>
          </Figure>
        </div>

        <div className="flex flex-col gap-1">
          {notes.map((n) => (
            <p key={n} className={MICRO}>
              {n}
            </p>
          ))}
        </div>
      </div>
    </Card>
  );
}
