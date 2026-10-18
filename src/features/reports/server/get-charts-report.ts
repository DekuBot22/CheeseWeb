import "server-only";
import { weeklySeries } from "@/domain/accounting";
import { receivables } from "@/domain/receivables";
import { currentWeek, lastWeeks } from "@/domain/week-calendar";
import { getWeekCalendar } from "@/features/weeks/server/get-week-calendar";
import { listOpenOrders } from "@/features/orders/server/orders.repo";
import { loadPeriod } from "./load-period";

// Datos de la página de gráficas: las últimas N semanas y la deuda de hoy por antigüedad.
export async function getChartsReport(weeks: number, now: Date = new Date()) {
  const cal = await getWeekCalendar(now);
  const list = lastWeeks(cal, weeks, currentWeek(cal));

  const [period, openOrders] = await Promise.all([loadPeriod(list[0].start, null), listOpenOrders()]);
  const series = weeklySeries(period, list);

  return {
    series,
    selected: series[series.length - 1],
    aging: receivables(openOrders, now).aging,
  };
}
