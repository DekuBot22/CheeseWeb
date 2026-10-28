"use client";

import { useState } from "react";
import { cx } from "@/lib/cx";
import { IconCalendar } from "@/ui/icons";
import { useWeekScope } from "./WeekScopeProvider";
import { WeekScopeSheet } from "./WeekScopeSheet";
import { weekShortLabel } from "./week-scope-labels";

// Selector de semana de la barra superior (móvil): botón que abre la lista de semanas.
export function WeekScopeMobile() {
  const { scope } = useWeekScope();
  const [open, setOpen] = useState(false);
  const { isCurrent } = scope;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Semana: ${isCurrent ? "actual" : weekShortLabel(scope.week)}. Cambiar semana`}
        className={cx(
          "presionable flex h-11 min-w-0 items-center gap-1.5 rounded-sm border px-2.5 text-xs font-medium",
          isCurrent ? "border-linea bg-hoja text-tinta-2" : "border-aviso-borde bg-aviso-bg text-tinta"
        )}
      >
        <IconCalendar width={16} height={16} />
        <span className="num truncate">{isCurrent ? "Semana actual" : weekShortLabel(scope.week)}</span>
      </button>
      <WeekScopeSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}
