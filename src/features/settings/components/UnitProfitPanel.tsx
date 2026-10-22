import { unitProfit } from "@/domain/pricing";
import { perLbToPerKg } from "@/domain/units";
import { formatCOP } from "@/lib/format";
import { cx } from "@/lib/cx";

// Lo que el dueño gana por libra, en vivo mientras escribe, y el estimado por kilo.
// Ejemplo: venta 13.000 − costo 11.000 = gana 2.000 por libra (≈ 15 % del precio).
export function UnitProfitPanel({ priceLb, costLb }: { priceLb: number; costLb: number }) {
  const hasPrice = Number.isFinite(priceLb) && priceLb > 0;
  const hasCost = Number.isFinite(costLb) && costLb > 0;
  const { ganancia, margen } = unitProfit(priceLb, costLb);

  return (
    <div className="rounded-md border border-linea bg-hoja-2 p-4" aria-live="polite">
      <p className="text-xs/4 font-medium text-tinta-3">Ganancia por libra</p>

      {!hasPrice || !hasCost ? (
        <p className="mt-1 text-sm text-tinta-2">
          {hasPrice ? "Escribe el costo por libra para ver tu ganancia." : "Escribe el precio de venta por libra."}
        </p>
      ) : (
        <>
          <p className="mt-1 flex flex-wrap items-baseline gap-x-3">
            <span
              className={cx("num font-display text-[2.5rem] font-medium leading-none", ganancia >= 0 ? "text-cobrado" : "text-debe")}
            >
              {ganancia >= 0 ? formatCOP(ganancia) : `−${formatCOP(Math.abs(ganancia))}`}
            </span>
            <span className="num text-sm text-tinta-2">
              {ganancia >= 0 ? `${margen.toFixed(0)} % del precio` : "Pierdes por cada libra"}
            </span>
          </p>
          <p className="num mt-1 text-[0.8125rem] text-tinta-3">
            {formatCOP(priceLb)} − {formatCOP(costLb)}
          </p>
          {ganancia < 0 && (
            <p className="mt-2 text-[0.8125rem] font-medium text-debe">
              El costo es mayor que el precio de venta. Revisa los valores antes de guardar.
            </p>
          )}
          <p className="num mt-3 border-t border-linea pt-2 text-[0.8125rem] text-tinta-2">
            Estimado por kilo: ≈ {formatCOP(perLbToPerKg(priceLb))} venta · ≈ {formatCOP(perLbToPerKg(costLb))} costo · ≈{" "}
            {ganancia >= 0 ? formatCOP(perLbToPerKg(ganancia)) : `−${formatCOP(perLbToPerKg(Math.abs(ganancia)))}`} ganancia
          </p>
        </>
      )}
    </div>
  );
}
