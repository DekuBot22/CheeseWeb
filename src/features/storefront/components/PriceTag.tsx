import { KG_PER_LB } from "@/domain/units";
import { formatCOP, formatDate } from "@/lib/format";

// Precio por kg y por libra, como una etiqueta colgante con muescas.
export function PriceTag({ pricePerKg, updatedAt }: { pricePerKg: number; updatedAt: string | null }) {
  return (
    <>
      <div className="price-tag mb-1 rounded-xl bg-corteza/40 px-5 py-3">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-medium text-tinta/80">Precio por kg</span>
          <span className="font-mono text-lg font-bold text-tinta">{formatCOP(pricePerKg)}</span>
        </div>
        <div className="mt-0.5 flex items-baseline justify-between">
          <span className="text-xs font-medium text-tinta/60">Precio por libra</span>
          <span className="font-mono text-sm font-semibold text-tinta/80">
            {formatCOP(pricePerKg * KG_PER_LB)}
          </span>
        </div>
      </div>
      {updatedAt && <p className="mb-5 mt-1.5 text-xs text-tinta/50">Actualizado el {formatDate(updatedAt)}</p>}
    </>
  );
}
