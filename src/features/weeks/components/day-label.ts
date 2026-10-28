import type { DayCell, MonthWeek } from "@/domain/week-month";
import { formatDayShort, formatLongDay, plural } from "@/lib/format";

// Texto de la semana ("10 oct – 17 oct · 8 días" se arma aparte): rango corto o "en curso".
export function weekRangeLabel(week: Pick<MonthWeek, "from" | "to">): string {
  return `${formatDayShort(week.from)} ${week.to ? `al ${formatDayShort(week.to)}` : "en curso"}`;
}

// Nombre accesible de cada día: "sábado 18 de octubre, llegó el queso, semana del 18 oct al 23 oct".
export function dayLabel(cell: DayCell, weeks: MonthWeek[]): string {
  const long = formatLongDay(cell.date) + (cell.sales ? `, ${plural(cell.sales, "venta")}` : "");
  if (cell.isFuture) return `${long}, todavía no llega`;
  if (!cell.weekFrom) return `${long}, sin semana`;
  const week = weeks.find((w) => w.from === cell.weekFrom);
  const range = week ? weekRangeLabel(week) : `desde el ${formatDayShort(cell.weekFrom)}`;
  return `${long}${cell.isStart ? ", llegó el queso" : ""}, semana del ${range}`;
}
