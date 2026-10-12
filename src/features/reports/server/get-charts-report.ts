import "server-only";
import { weeklySeries } from "@/domain/accounting";
import { receivables } from "@/domain/receivables";
import { shiftWeek, weekRange } from "@/domain/week";
import { listOpenOrders } from "@/features/orders/server/orders.repo";
import { loadPeriod } from "./load-period";

// Datos de la página de gráficas: las últimas N semanas y la deuda de hoy por antigüedad.
export async function getChartsReport(weeks: number, now: Date = new Date()) {
  const current = weekRange(now);
  const start = weekRange(shiftWeek(current.start.toISOString(), -(weeks - 1))).start;

  const [period, openOrders] = await Promise.all([loadPeriod(start, null), listOpenOrders()]);
  const series = weeklySeries(period, weeks, now);

  return {
    series,
    selected: series[series.length - 1],
    aging: receivables(openOrders, now).aging,
  };
}
