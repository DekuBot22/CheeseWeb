import "server-only";
import { sumWeeks, weeklySeries, type PeriodData, type WeekPoint } from "@/domain/accounting";
import { parseWeekParam, shiftWeek, weekRange } from "@/domain/week";
import type { ProfitView } from "../profit-views";
import { loadPeriod } from "./load-period";

const MAX_ALL_WEEKS = 260;
export const MAX_SHOWN_WEEKS = 26;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// Cuántas semanas hay desde el primer movimiento hasta hoy (para la vista "todo").
function countWeeksSinceFirst(data: PeriodData, currentStart: Date, now: Date): number {
  const first = Math.min(
    ...data.orders.map((o) => new Date(o.created_at).getTime()),
    ...data.purchases.map((p) => new Date(`${p.purchase_date}T12:00:00-05:00`).getTime()),
    now.getTime()
  );
  const weeksBack = Math.round((currentStart.getTime() - weekRange(new Date(first)).start.getTime()) / WEEK_MS);
  return Math.min(Math.max(weeksBack + 1, 1), MAX_ALL_WEEKS);
}

// Semana que se está mirando: la del parámetro de la URL o la actual (nunca el futuro).
function pickWeek(view: ProfitView, weekParam: string | undefined, currentWeek: { start: Date; end: Date }) {
  const parsed = view === "semana" ? parseWeekParam(weekParam) : null;
  const anchor = parsed ? weekRange(parsed) : currentWeek;
  return anchor.start.getTime() > currentWeek.start.getTime() ? currentWeek : anchor;
}

// Rango que baja el botón de Excel según el período mostrado.
function exportRange(view: ProfitView, week: { start: Date; end: Date }, rangeStart: Date, now: Date) {
  if (view === "semana") return { start: week.start, end: week.end };
  if (view === "12") return { start: rangeStart, end: week.end };
  return { start: new Date(0), end: now };
}

// Cifras, semanas y rango de exportación de la pantalla Ganancias.
export async function getProfitReport(view: ProfitView, weekParam: string | undefined, now: Date = new Date()) {
  const currentWeek = weekRange(now);
  const week = pickWeek(view, weekParam, currentWeek);

  const isAll = view === "todo";
  const rangeStart = isAll ? new Date(0) : weekRange(shiftWeek(week.start.toISOString(), -11)).start;
  const data = await loadPeriod(rangeStart, isAll ? null : week.end);

  const count = isAll ? countWeeksSinceFirst(data, currentWeek.start, now) : 12;
  const series = weeklySeries(data, count, isAll ? now : week.start);
  const selected: WeekPoint = series[series.length - 1];
  const visible = series.slice(-MAX_SHOWN_WEEKS);
  const single = view === "semana";

  return {
    week,
    isCurrent: week.start.getTime() === currentWeek.start.getTime(),
    rangeStart,
    series,
    visible,
    selected,
    previous: series[series.length - 2] as WeekPoint | undefined,
    stats: single ? selected.stats : sumWeeks(series),
    kg: single ? selected.kgSold : series.reduce((s, w) => s + w.kgSold, 0),
    orderCount: single ? selected.orderCount : series.reduce((s, w) => s + w.orderCount, 0),
    estimatedWeeks: visible.filter((w) => !w.stats.usingRealCost && w.stats.revenue > 0),
    export: exportRange(view, week, rangeStart, now),
  };
}
