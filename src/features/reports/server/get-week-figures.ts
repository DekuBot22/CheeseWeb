import "server-only";
import { weeklySeries } from "@/domain/accounting";
import { currentWeek, dayStart, weeksSince } from "@/domain/week-calendar";
import { MAX_LISTED_WEEKS } from "@/domain/week-scope";
import { weekFigures, type WeekFigure } from "@/domain/week-figures";
import { getWeekScopeData } from "@/features/weeks/server/get-week-scope-data";
import { loadPeriod } from "./load-period";

// Ganancia y por cobrar de las semanas de la lista del selector (la más nueva primero).
// Se pide solo al abrir la lista, no en cada pantalla, para no recargar el panel.
export async function getWeekFigures(now: Date = new Date()): Promise<WeekFigure[]> {
  const { cal, firstDay } = await getWeekScopeData(now);
  const weeks = weeksSince(cal, dayStart(firstDay), currentWeek(cal), MAX_LISTED_WEEKS);
  if (weeks.length === 0) return [];
  const data = await loadPeriod(weeks[0].start, null);
  return weekFigures(weeks, weeklySeries(data, weeks)).reverse();
}
