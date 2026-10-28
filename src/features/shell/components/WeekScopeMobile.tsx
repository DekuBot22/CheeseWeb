"use client";

import Link from "next/link";
import { useState } from "react";
import { cx } from "@/lib/cx";
import { IconCalendar } from "@/ui/icons";
import { Sheet } from "@/ui/Sheet";
import { useWeekScope } from "./WeekScopeProvider";
import { weekCaption, weekShortLabel } from "./week-scope-labels";

// Selector de semana de la barra superior (móvil): botón que abre la lista de semanas.
export function WeekScopeMobile() {
  const { scope, weeks, hrefFor, withScope } = useWeekScope();
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

      <Sheet open={open} onClose={() => setOpen(false)} title="Elegir semana">
        <div className="flex flex-col gap-4">
          {!isCurrent && (
            <Link
              href={hrefFor(null)}
              onClick={() => setOpen(false)}
              className="presionable flex h-11 items-center justify-center rounded-sm bg-boton text-[0.8125rem] font-medium text-sobre-boton"
            >
              Volver a la semana actual
            </Link>
          )}
          <ul className="-mx-2 flex flex-col">
            {weeks.map((week, i) => {
              const selected = week.from === scope.week.from;
              return (
                <li key={week.from}>
                  <Link
                    href={hrefFor(i === 0 ? null : week)}
                    onClick={() => setOpen(false)}
                    aria-current={selected ? "true" : undefined}
                    className={cx(
                      "flex min-h-11 items-center justify-between gap-3 rounded-sm px-2 text-sm",
                      selected ? "bg-hoja-2 font-medium text-tinta" : "text-tinta-2 hover:bg-hoja-2"
                    )}
                  >
                    <span className="num">{weekShortLabel(week)}</span>
                    <span className="text-xs text-tinta-3">{weekCaption(week, i === 0)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link
            href={withScope("/admin/ajustes")}
            onClick={() => setOpen(false)}
            className="text-center text-xs font-medium text-tinta-2 underline-offset-2 hover:underline"
          >
            Editar semanas en Ajustes
          </Link>
        </div>
      </Sheet>
    </>
  );
}
