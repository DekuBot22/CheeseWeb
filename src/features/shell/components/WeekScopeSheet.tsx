"use client";

import Link from "next/link";
import { formatCOP } from "@/lib/format";
import { cx } from "@/lib/cx";
import { Sheet } from "@/ui/Sheet";
import type { WeekFigure } from "@/domain/week-figures";
import { useWeekScope } from "./WeekScopeProvider";
import { useWeekFigures } from "./use-week-figures";
import { weekCaption, weekShortLabel } from "./week-scope-labels";

function Figures({ figure }: { figure: WeekFigure | undefined }) {
  if (!figure) return <span className="h-8 w-16 animate-pulse rounded-sm bg-hoja-2" aria-hidden="true" />;
  if (figure.orders === 0) return <span className="text-xs text-tinta-3">Sin ventas</span>;
  return (
    <span className="flex flex-col items-end">
      <span className="num text-sm font-medium text-tinta">{formatCOP(figure.profit)}</span>
      <span className="num text-[0.6875rem]/[0.875rem] text-tinta-3">
        {figure.pending > 0 ? `por cobrar ${formatCOP(figure.pending)}` : "todo cobrado"}
      </span>
    </span>
  );
}

// Lista de semanas con su ganancia y lo que falta por cobrar (hoja en celular, ventana en PC).
export function WeekScopeSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { scope, weeks, hrefFor, withScope } = useWeekScope();
  const figures = useWeekFigures(open);
  const byWeek = figures.status === "ready" ? figures.byWeek : null;

  return (
    <Sheet open={open} onClose={onClose} title="Elegir semana">
      <div className="flex flex-col gap-4">
        {!scope.isCurrent && (
          <Link
            href={hrefFor(null)}
            onClick={onClose}
            className="presionable flex h-11 items-center justify-center rounded-sm bg-boton text-[0.8125rem] font-medium text-sobre-boton"
          >
            Volver a la semana actual
          </Link>
        )}
        {figures.status === "error" && (
          <p className="text-xs text-tinta-3">No pude cargar las cifras de cada semana. Igual puedes elegir una.</p>
        )}
        <ul className="-mx-2 flex flex-col">
          {weeks.map((week, i) => {
            const selected = week.from === scope.week.from;
            return (
              <li key={week.from}>
                <Link
                  href={hrefFor(i === 0 ? null : week)}
                  onClick={onClose}
                  aria-current={selected ? "true" : undefined}
                  className={cx(
                    "flex min-h-12 items-center justify-between gap-3 rounded-sm px-2 py-1.5 text-sm",
                    selected ? "bg-hoja-2 font-medium text-tinta" : "text-tinta-2 hover:bg-hoja-2"
                  )}
                >
                  <span className="flex flex-col">
                    <span className="num">{weekShortLabel(week)}</span>
                    <span className="text-xs font-normal text-tinta-3">{weekCaption(week, i === 0)}</span>
                  </span>
                  {figures.status === "error" ? null : <Figures figure={byWeek?.get(week.from)} />}
                </Link>
              </li>
            );
          })}
        </ul>
        <Link
          href={withScope("/admin/ajustes")}
          onClick={onClose}
          className="text-center text-xs font-medium text-tinta-2 underline-offset-2 hover:underline"
        >
          Editar semanas en Ajustes
        </Link>
      </div>
    </Sheet>
  );
}
