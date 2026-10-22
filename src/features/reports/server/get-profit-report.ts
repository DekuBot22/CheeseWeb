import "server-only";
import { sumWeeks, weeklySeries, type PeriodData, type WeekPoint } from "@/domain/accounting";
import { parseWeekParam } from "@/domain/week";
import {
  currentWeek,
  lastWeeks,
  nextWeek,
  previousWeek,
  weekOf,
  weeksSince,
  type Week,
  type WeekCalendar,
} from "@/domain/week-calendar";
import { getWeekCalendar } from "@/features/weeks/server/get-week-calendar";
import type { ProfitView } from "../profit-views";
import { loadPeriod } from "./load-period";

const MAX_ALL_WEEKS = 260;
export const MAX_SHOWN_WEEKS = 26;

// Instante del primer movimiento registrado (o `now` si no hay nada), para la vista "todo".
function firstMovement(data: PeriodData, now: Date): Date {
  let first = now.getTime();
  for (const o of data.orders) first = Math.min(first, new Date(o.created_at).getTime());
  for (const p of data.purchases) first = Math.min(first, new Date(`${p.purchase_date}T12:00:00-05:00`).getTime());
  return new Date(first);
}

// Semana que se está mirando: la del parámetro de la URL o la actual (nunca el futuro).
function pickWeek(view: ProfitView, weekParam: string | undefined, cal: WeekCalendar): Week {
  const parsed = view === "semana" ? parseWeekParam(weekParam) : null;
  return parsed ? weekOf(cal, parsed) : currentWeek(cal);
}

// Rango que baja el botón de Excel según el período mostrado.
function exportRange(view: ProfitView, week: Week, rangeStart: Date, now: Date) {
  if (view === "semana") return { start: week.start, end: week.end };
  if (view === "12") return { start: rangeStart, end: week.end };
  return { start: new Date(0), end: now };
}

// Cifras, semanas y rango de exportación de la pantalla Ganancias.
export async function getProfitReport(view: ProfitView, weekParam: string | undefined, now: Date = new Date()) {
  const cal = await getWeekCalendar(now);
  const current = currentWeek(cal);
  const week = pickWeek(view, weekParam, cal);

  const isAll = view === "todo";
  const rangeStart = isAll ? new Date(0) : lastWeeks(cal, 12, week)[0].start;
  const data = await loadPeriod(rangeStart, isAll ? null : week.end);

  const weeks = isAll
    ? weeksSince(cal, firstMovement(data, now), current, MAX_ALL_WEEKS)
    : lastWeeks(cal, 12, week);
  const series = weeklySeries(data, weeks);
  const selected: WeekPoint = series[series.length - 1];
  const visible = series.slice(-MAX_SHOWN_WEEKS);
  const single = view === "semana";

  return {
    now,
    week,
    isCurrent: week.start.getTime() === current.start.getTime(),
    prevWeek: previousWeek(cal, week),
    nextWeek: nextWeek(cal, week),
    rangeStart,
    series,
    visible,
    selected,
    previous: series[series.length - 2] as WeekPoint | undefined,
    stats: single ? selected.stats : sumWeeks(series),
    kg: single ? selected.kgSold : series.reduce((s, w) => s + w.kgSold, 0),
    orderCount: single ? selected.orderCount : series.reduce((s, w) => s + w.orderCount, 0),
    export: exportRange(view, week, rangeStart, now),
  };
}
