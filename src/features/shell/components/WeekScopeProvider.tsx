"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { MAX_LISTED_WEEKS, resolveWeek, type WeekScope } from "@/domain/week-scope";
import { currentWeek, dayStart, weeksSince, type Week, type WeekCalendar } from "@/domain/week-calendar";
import { withWeekParam } from "@/lib/week-param";

interface WeekScopeValue {
  cal: WeekCalendar;
  scope: WeekScope;
  // Semanas para elegir, la más nueva primero (desde el primer día con movimientos).
  weeks: Week[];
  // Enlace de esta misma pantalla en otra semana (null = semana actual).
  hrefFor: (week: Week | null) => string;
  // Mismo enlace con la semana elegida ahora (si ya trae `semana`, se respeta).
  withScope: (href: string) => string;
}

const Ctx = createContext<WeekScopeValue | null>(null);

// La semana elegida vive solo en la URL (`?semana=`). El layout no se vuelve a pintar al navegar,
// así que la semana se lee aquí, en el cliente, y nunca de las props del layout.
export function WeekScopeProvider({
  cal,
  firstDay,
  children,
}: {
  cal: WeekCalendar;
  firstDay: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const search = useSearchParams();
  const scope = useMemo(() => resolveWeek(cal, search.get("semana") ?? undefined), [cal, search]);

  const weeks = useMemo(
    () => weeksSince(cal, dayStart(firstDay), currentWeek(cal), MAX_LISTED_WEEKS).reverse(),
    [cal, firstDay]
  );

  const rest = search.toString();
  const hrefFor = useCallback(
    (week: Week | null) => {
      const target = week && week.from !== currentWeek(cal).from ? week.from : null;
      return withWeekParam(`${pathname}${rest ? `?${rest}` : ""}`, target);
    },
    [cal, pathname, rest]
  );
  const withScope = useCallback(
    (href: string) => (/[?&]semana=/.test(href) ? href : withWeekParam(href, scope.param)),
    [scope.param]
  );

  const value = useMemo(() => ({ cal, scope, weeks, hrefFor, withScope }), [cal, scope, weeks, hrefFor, withScope]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWeekScope(): WeekScopeValue {
  const value = useContext(Ctx);
  if (!value) throw new Error("useWeekScope debe usarse dentro de WeekScopeProvider");
  return value;
}
