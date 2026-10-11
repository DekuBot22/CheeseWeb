import "server-only";
import { percentChange, weeklySeries } from "@/domain/accounting";
import { receivables } from "@/domain/receivables";
import { shiftWeek, weekRange } from "@/domain/week";
import { listOpenOrders, listPendingOrders } from "@/features/orders/server/orders.repo";
import { getProviderBalance } from "@/features/purchases/server/get-provider-balance";
import { getSettings } from "@/features/settings/server/settings.repo";
import { loadPeriod } from "./load-period";

export const DASHBOARD_WEEKS = 8;

// Todo lo que pinta el Inicio: la semana actual frente a la anterior, las
// últimas 8 semanas, cuentas por cobrar, saldo con el proveedor y pendientes.
export async function getDashboard(now: Date = new Date()) {
  const current = weekRange(now);
  const seriesStart = weekRange(shiftWeek(current.start.toISOString(), -(DASHBOARD_WEEKS - 1))).start;

  const [range, openOrders, provider, settings, pending] = await Promise.all([
    loadPeriod(seriesStart, null),
    listOpenOrders(),
    getProviderBalance(),
    getSettings(),
    listPendingOrders(6),
  ]);

  const series = weeklySeries(range, DASHBOARD_WEEKS, now);
  const cur = series[DASHBOARD_WEEKS - 1];
  const prev = series[DASHBOARD_WEEKS - 2];

  return {
    current,
    series,
    cur,
    revenueChange: percentChange(cur.stats.revenue, prev.stats.revenue),
    profitChange: percentChange(cur.stats.profit, prev.stats.profit),
    collectedPct: cur.stats.revenue > 0 ? (cur.stats.collected / cur.stats.revenue) * 100 : 0,
    anyEstimated: series.some((w) => !w.stats.usingRealCost && w.stats.revenue > 0),
    openOrders,
    debt: receivables(openOrders, now),
    provider,
    settings,
    pending,
  };
}
