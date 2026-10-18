import "server-only";
import { percentChange, weeklySeries } from "@/domain/accounting";
import { receivables } from "@/domain/receivables";
import { activeOnly } from "@/domain/void";
import { currentWeek, lastWeeks } from "@/domain/week-calendar";
import { openWeekHint, weekElapsed } from "@/domain/week-hint";
import { getWeekCalendar } from "@/features/weeks/server/get-week-calendar";
import { listWeekOpenings } from "@/features/weeks/server/week-openings.repo";
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

  const [range, openOrders, provider, settings, pending, { ready: openingsReady }] = await Promise.all([
    loadPeriod(weeks[0].start, null),
    listOpenOrders(),
    getProviderBalance(),
    getSettings(),
    listPendingOrders(6),
    listWeekOpenings(),
  ]);

  const [prev, cur] = weeklySeries(range, weeks);
  const purchaseDates = activeOnly(range.purchases).map((p) => p.purchase_date).filter((d) => d >= current.from);

  return {
    current,
    cur,
    prev,
    weekPrompt: {
      hint: openWeekHint(current, cal.today, purchaseDates),
      elapsed: weekElapsed(current, cal.today),
      lastOpening: cal.openings[cal.openings.length - 1] ?? null,
      today: cal.today,
      ready: openingsReady,
    },
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
