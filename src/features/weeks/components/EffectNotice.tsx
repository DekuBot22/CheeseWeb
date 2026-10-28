"use client";

import { formatCOP, formatDay, formatDayShort, plural } from "@/lib/format";
import { Callout } from "@/ui/Callout";
import type { EffectPreview } from "../types";
import { useOpeningEffect, type EffectParams } from "./use-opening-effect";

function summary(p: EffectPreview): string {
  const parts: string[] = [];
  if (p.orders.count) parts.push(`${plural(p.orders.count, "pedido")} (${formatCOP(p.orders.total)})`);
  if (p.purchases.count) parts.push(`${plural(p.purchases.count, "compra")} (${formatCOP(p.purchases.total)})`);
  if (p.providerMovements) parts.push(`${plural(p.providerMovements, "movimiento")} del proveedor`);
  return parts.length > 1 ? `${parts.slice(0, -1).join(", ")} y ${parts[parts.length - 1]}` : parts[0];
}

// Vista previa de "desde / hasta": cómo quedan las semanas tocadas y qué se mueve entre ellas.
function RangeNotice({ preview, moved, compact }: { preview: EffectPreview; moved: string | null | undefined; compact: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      {moved ? (
        <Callout tone="aviso">Cambian de semana: {moved}. Cambia la ganancia de esas semanas.</Callout>
      ) : (
        <Callout tone="info">No cambia ningún pedido ni compra de semana: las cifras quedan iguales.</Callout>
      )}
      {!compact && !!preview.after?.length && (
        <div className="text-[0.8125rem] text-tinta-2">
          <p className="font-medium text-tinta">Así quedan:</p>
          <ul className="mt-1 flex flex-col gap-0.5">
            {preview.after.map((w) => (
              <li key={w.from} className="num">
                {formatDayShort(w.from)} – {formatDayShort(w.to)} · {plural(w.days, "día")}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Antes de confirmar: qué pedidos y compras cambian de semana (y por tanto la ganancia de ambas semanas).
export function EffectNotice({ params, compact = false }: { params: EffectParams | null; compact?: boolean }) {
  const { preview, error, loading } = useOpeningEffect(params);
  if (!params) return null;
  if (error) return <Callout tone="debe">{error}</Callout>;
  if (loading || !preview) return <p className="text-[0.8125rem] text-tinta-2">Calculando qué cambia…</p>;

  const { effect } = preview;
  const moved = effect && summary(preview);
  if (preview.after) return <RangeNotice preview={preview} moved={moved} compact={compact} />;
  if (!effect || !moved) {
    return <Callout tone="info">No cambia ningún pedido ni compra de semana: las cifras quedan iguales.</Callout>;
  }
  return (
    <Callout tone="aviso">
      Pasan de la semana del {formatDay(effect.fromWeek)} a la del {formatDay(effect.toWeek)}: {moved}. Cambia la
      ganancia de esas dos semanas.
    </Callout>
  );
}
