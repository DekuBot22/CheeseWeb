import "server-only";
import { monthlyCollection } from "@/domain/monthly-collection";
import { listOpenOrders } from "@/features/orders/server/orders.repo";
import { getWeekCalendar } from "@/features/weeks/server/get-week-calendar";
import { listClients } from "./clients.repo";

const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

// Cobro del mes por cliente. `monthParam` viene de la URL (`?mes=AAAA-MM`); inválido, vacío o futuro = mes actual.
export async function getMonthlyCollection(monthParam: string | undefined, now: Date = new Date()) {
  const [cal, orders, clients] = await Promise.all([getWeekCalendar(now), listOpenOrders(), listClients()]);
  const current = cal.today.slice(0, 7);
  const month = monthParam && MONTH.test(monthParam) && monthParam <= current ? monthParam : current;
  const phones = new Map(clients.map((c) => [c.id, c.phone]));
  return { ...monthlyCollection(orders, phones, cal, month), current };
}
