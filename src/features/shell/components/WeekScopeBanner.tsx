"use client";

import Link from "next/link";
import { Dot } from "@/ui/Dot";
import { useWeekScope } from "./WeekScopeProvider";
import { weekShortLabel } from "./week-scope-labels";

// Franja fija y discreta mientras se mira una semana que no es la actual: una sola línea (sin
// recuadro ni párrafo) para que nadie registre algo creyendo que es hoy, sin quitar espacio ni atención.
// El detalle de qué fecha lleva cada venta/abono vive en los formularios, que ya lo avisan.
export function WeekScopeBanner() {
  const { scope, hrefFor } = useWeekScope();
  if (scope.isCurrent) return null;

  return (
    <div
      role="note"
      className="aparece sticky top-14 z-10 -mx-4 mb-3 flex items-center gap-2 border-b border-linea-suave bg-papel px-4 py-1.5 text-xs/4 md:top-0 md:-mx-8 md:px-8"
    >
      <Dot tone="aviso" />
      <p className="min-w-0 flex-1 truncate text-tinta-2">
        Viendo <span className="font-medium text-tinta">{weekShortLabel(scope.week)}</span>
      </p>
      <Link
        href={hrefFor(null)}
        scroll={false}
        className="-my-1.5 shrink-0 py-3 font-medium text-acento transition-colors duration-150 hover:text-acento-hover md:py-1.5"
      >
        Volver a la actual
      </Link>
    </div>
  );
}
