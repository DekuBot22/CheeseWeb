import "server-only";
import { activeOnly } from "@/domain/void";
import { currentWeek, lastWeeks } from "@/domain/week-calendar";
import { weekContext } from "@/domain/week-hint";
import type { WeekRow } from "../types";
import { getWeekCalendar } from "./get-week-calendar";
import { listWeekOpenings } from "./week-openings.repo";

export const WEEKS_SHOWN = 12;

// Las últimas semanas (la más nueva primero) con la apertura que las abrió, para la lista de Ajustes.
export async function getWeeksOverview(now: Date = new Date()) {
  const [cal, { openings, ready }] = await Promise.all([getWeekCalendar(now), listWeekOpenings()]);
  const active = activeOnly(openings);
  const current = currentWeek(cal);
  const rows: WeekRow[] = lastWeeks(cal, WEEKS_SHOWN, current)
    .reverse()
    .map((w) => {
      const opening = w.manual ? active.find((o) => o.start_date === w.from) : undefined;
      return { from: w.from, to: w.to, days: w.days, openingId: opening?.id ?? null, note: opening?.note ?? null };
    });
  return { rows, ready, context: weekContext(cal, current) };
}
