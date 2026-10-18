"use client";

import { formatCOP, formatDay, plural } from "@/lib/format";
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

// Antes de confirmar: qué pedidos y compras cambian de semana (y por tanto la ganancia de ambas semanas).
export function EffectNotice({ params }: { params: EffectParams | null }) {
  const { preview, error, loading } = useOpeningEffect(params);
  if (!params) return null;
  if (error) return <Callout tone="debe">{error}</Callout>;
  if (loading || !preview) return <p className="text-[0.8125rem] text-tinta-2">Calculando qué cambia…</p>;

  const { effect } = preview;
  const moved = effect && summary(preview);
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
