"use client";

import Link from "next/link";
import { Banner } from "@/ui/Banner";
import { buttonClasses } from "@/ui/Button";
import { useWeekScope } from "./WeekScopeProvider";
import { weekShortLabel } from "./week-scope-labels";

// Franja fija mientras se mira una semana que no es la actual: así nadie registra algo creyendo que es hoy.
export function WeekScopeBanner() {
  const { scope, hrefFor } = useWeekScope();
  if (scope.isCurrent) return null;

  return (
    <div className="aparece sticky top-14 z-10 -mx-4 mb-4 bg-papel px-4 pb-2 pt-2 md:top-0 md:-mx-8 md:px-8">
      <Banner
        title={`Estás viendo la semana ${weekShortLabel(scope.week)}`}
        actions={
          <Link href={hrefFor(null)} scroll={false} className={buttonClasses("secondary", "sm")}>
            Volver a la actual
          </Link>
        }
      >
        Pedidos, deudas y cifras son de esa semana.
      </Banner>
    </div>
  );
}
