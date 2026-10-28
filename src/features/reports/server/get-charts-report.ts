import "server-only";
import { isEmptyWeek, weeklySeries } from "@/domain/accounting";
import { receivables } from "@/domain/receivables";
import { dropEmptyLead, lastWeeks } from "@/domain/week-calendar";
import { resolveWeek, scopeOrders } from "@/domain/week-scope";
import { getWeekCalendar } from "@/features/weeks/server/get-week-calendar";
import { listOpenOrders } from "@/features/orders/server/orders.repo";
import { loadPeriod } from "./load-period";

// Datos de la página de gráficas: las últimas N semanas (terminan en la elegida, por defecto la actual)
// y la deuda de hoy por antigüedad (en una semana pasada, la de los pedidos de esa semana).
export async function getChartsReport(weeks: number, semana?: string, now: Date = new Date()) {
  const cal = await getWeekCalendar(now);
  const scope = resolveWeek(cal, semana);
  const list = lastWeeks(cal, weeks, scope.week);

  const [period, allOpen] = await Promise.all([
    loadPeriod(list[0].start, scope.isCurrent ? null : scope.week.end),
    listOpenOrders(),
  ]);
  const openOrders = scopeOrders(allOpen, scope.isCurrent ? null : scope.week);
  const series = dropEmptyLead(weeklySeries(period, list), isEmptyWeek);

  return {
    series,
    selected: series[series.length - 1],
    semana: scope.param,
    aging: receivables(openOrders, now).aging,
  };
}
