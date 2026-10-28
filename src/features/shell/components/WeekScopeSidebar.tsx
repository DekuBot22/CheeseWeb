"use client";

import Link from "next/link";
import { useState } from "react";
import { nextWeek, previousWeek, type Week } from "@/domain/week-calendar";
import { cx } from "@/lib/cx";
import { IconChevronLeft, IconChevronRight } from "@/ui/icons";
import { useWeekScope } from "./WeekScopeProvider";
import { WeekScopeSheet } from "./WeekScopeSheet";
import { weekCaption, weekShortLabel } from "./week-scope-labels";

const ARROW =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-sm text-tinta-2 transition-colors duration-(--dur-rapida) hover:bg-hoja-2 hover:text-tinta";

function Arrow({ href, label, children }: { href: string | null; label: string; children: React.ReactNode }) {
  if (!href) {
    return (
      <span aria-hidden="true" className={cx(ARROW, "opacity-40")}>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} aria-label={label} scroll={false} className={ARROW}>
      {children}
    </Link>
  );
}

// Selector de semana del menú lateral (PC): flechas, la semana elegida y el atajo a la actual.
export function WeekScopeSidebar({ firstDay }: { firstDay: string }) {
  const { cal, scope, hrefFor } = useWeekScope();
  const { week, isCurrent } = scope;
  const [open, setOpen] = useState(false);
  const prev: Week | null = week.from > firstDay ? previousWeek(cal, week) : null;
  const next = nextWeek(cal, week);

  return (
    <section aria-label="Semana que se está mirando" className="rounded-md border border-linea bg-hoja p-2">
      <div className="flex items-center justify-between gap-1">
        <Arrow href={prev ? hrefFor(prev) : null} label="Semana anterior">
          <IconChevronLeft />
        </Arrow>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Ver todas las semanas"
          className="min-w-0 flex-1 rounded-sm py-0.5 text-center transition-colors duration-(--dur-rapida) hover:bg-hoja-2"
        >
          <p className="num truncate text-sm/5 font-medium text-tinta">{weekShortLabel(week)}</p>
          <p className="text-[0.6875rem]/[0.875rem] font-medium text-tinta-3">{weekCaption(week, isCurrent)}</p>
        </button>
        <Arrow href={next ? hrefFor(next) : null} label="Semana siguiente">
          <IconChevronRight />
        </Arrow>
      </div>
      {!isCurrent && (
        <Link
          href={hrefFor(null)}
          scroll={false}
          className="mt-2 flex h-8 items-center justify-center rounded-sm bg-hoja-2 text-xs font-medium text-tinta hover:bg-hoja-3"
        >
          Semana actual
        </Link>
      )}
      <WeekScopeSheet open={open} onClose={() => setOpen(false)} />
    </section>
  );
}
