import "server-only";
import { percentChange, weeklySeries } from "@/domain/accounting";
import { receivables } from "@/domain/receivables";
import { currentWeek, lastWeeks } from "@/domain/week-calendar";
import { getWeekCalendar } from "@/features/weeks/server/get-week-calendar";
import { listOpenOrders, listPendingOrders } from "@/features/orders/server/orders.repo";
import { getProviderBalance } from "@/features/purchases/server/get-provider-balance";
import { getSettings } from "@/features/settings/server/settings.repo";
import { loadPeriod } from "./load-period";

// Con dos semanas alcanza para la variación frente a la anterior; las gráficas largas viven en /admin/ganancias/graficas.

// Todo lo que pinta el Inicio: la semana actual frente a la anterior, cuentas por
// cobrar, saldo con el proveedor y pendientes.
export async function getDashboard(now: Date = new Date()) {
  const cal = await getWeekCalendar(now);
  const current = currentWeek(cal);
  const weeks = lastWeeks(cal, 2, current);

  const [range, openOrders, provider, settings, pending] = await Promise.all([
    loadPeriod(weeks[0].start, null),
    listOpenOrders(),
    getProviderBalance(),
    getSettings(),
    listPendingOrders(6),
  ]);

  const [prev, cur] = weeklySeries(range, weeks);

  return {
    current,
    cur,
    revenueChange: percentChange(cur.stats.revenue, prev.stats.revenue),
    profitChange: percentChange(cur.stats.profit, prev.stats.profit),
    collectedPct: cur.stats.revenue > 0 ? (cur.stats.collected / cur.stats.revenue) * 100 : 0,
    openOrders,
    debt: receivables(openOrders, now),
    provider,
    settings,
    pending,
  };
}
