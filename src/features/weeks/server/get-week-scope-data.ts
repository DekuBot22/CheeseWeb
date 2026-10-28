import "server-only";
import { bogotaDate } from "@/lib/bogota-time";
import type { WeekCalendar } from "@/domain/week-calendar";
import { getFirstOrderAt } from "@/features/orders/server/orders.repo";
import { getFirstPurchaseDate } from "@/features/purchases/server/purchases.repo";
import { getWeekCalendar } from "./get-week-calendar";

// Lo que necesita el selector de semana del panel: el calendario y el primer día con
// movimientos (tope hacia atrás de la lista; antes de eso no hay nada que ver).
export async function getWeekScopeData(now: Date = new Date()): Promise<{ cal: WeekCalendar; firstDay: string }> {
  const [cal, firstOrderAt, firstPurchase] = await Promise.all([
    getWeekCalendar(now),
    getFirstOrderAt(),
    getFirstPurchaseDate(),
  ]);
  const days = [cal.openings[0], firstOrderAt ? bogotaDate(new Date(firstOrderAt)) : undefined, firstPurchase ?? undefined];
  const firstDay = days.filter((d): d is string => Boolean(d)).sort()[0] ?? cal.today;
  return { cal, firstDay };
}
