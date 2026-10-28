import "server-only";
import { activeOnly } from "@/domain/void";
import { currentWeek, markedWeeks, nextWeek } from "@/domain/week-calendar";
import { weekContext } from "@/domain/week-hint";
import type { WeekRow } from "../types";
import { getWeekCalendar } from "./get-week-calendar";
import { listWeekOpenings } from "./week-openings.repo";

export const WEEKS_SHOWN = 12;

// Las semanas marcadas (la más nueva primero) con la apertura que las abrió, para la lista de Ajustes.
export async function getWeeksOverview(now: Date = new Date()) {
  const [cal, { openings, ready }] = await Promise.all([getWeekCalendar(now), listWeekOpenings()]);
  const active = activeOnly(openings);
  const current = currentWeek(cal);
  const rows: WeekRow[] = markedWeeks(cal, current, WEEKS_SHOWN)
    .reverse()
    .map((w) => {
      const opening = w.manual ? active.find((o) => o.start_date === w.from) : undefined;
      const next = nextWeek(cal, w);
      return { from: w.from, to: w.to, days: w.days, openingId: opening?.id ?? null, note: opening?.note ?? null, until: next?.from ?? null };
    });
  const refs = active.map((o) => ({ id: o.id, date: o.start_date }));
  return { rows, openings: refs, ready, context: weekContext(cal, current) };
}
