import "server-only";
import { percentChange, weeklySeries } from "@/domain/accounting";
import { receivables } from "@/domain/receivables";
import { activeOnly } from "@/domain/void";
import { lastWeeks } from "@/domain/week-calendar";
import { resolveWeek, scopeOrders } from "@/domain/week-scope";
import { openWeekHint, weekContext, weekElapsed } from "@/domain/week-hint";
import { getWeekCalendar } from "@/features/weeks/server/get-week-calendar";
import { listOpenOrders, listPendingOrders } from "@/features/orders/server/orders.repo";
import { getProviderBalance } from "@/features/purchases/server/get-provider-balance";
import { getSettings } from "@/features/settings/server/settings.repo";
import { loadPeriod } from "./load-period";

// Con dos semanas alcanza para la variación frente a la anterior; las gráficas largas viven en /admin/ganancias/graficas.

// Todo lo que pinta el Inicio: la semana elegida (por defecto la actual) frente a la anterior,
// cuentas por cobrar, saldo con el proveedor y pendientes.
// En la semana actual, deudores y pendientes son los de siempre (todo lo que se debe); en una semana
// pasada son solo los pedidos de esa semana, con lo que falta por cobrar de ellos HOY.
export async function getDashboard(semana?: string, now: Date = new Date()) {
  const cal = await getWeekCalendar(now);
  const scope = resolveWeek(cal, semana);
  const { isCurrent } = scope;
  const current = scope.week;
  const weeks = lastWeeks(cal, 2, current);
  const only = isCurrent ? null : current;

  const [range, allOpen, provider, settings, pending] = await Promise.all([
    loadPeriod(weeks[0].start, isCurrent ? null : current.end),
    listOpenOrders(),
    getProviderBalance(),
    getSettings(),
    listPendingOrders(6, only ?? undefined),
  ]);

  const openOrders = scopeOrders(allOpen, only);
  const [prev, cur] = weeklySeries(range, weeks);
  const purchaseDates = activeOnly(range.purchases).map((p) => p.purchase_date).filter((d) => d >= current.from);

  return {
    current,
    isCurrent,
    semana: scope.param,
    cur,
    prev,
    weekContext: weekContext(cal, current),
    weekHint: isCurrent ? openWeekHint(current, cal.today, purchaseDates) : null,
    weekElapsed: weekElapsed(current, cal.today),
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
