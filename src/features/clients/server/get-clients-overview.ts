import "server-only";
import {
  buildClientRows,
  filterClientRows,
  sortClientRows,
  type ClientSort,
} from "@/domain/client-balance";
import type { Week } from "@/domain/week-calendar";
import { scopeOrders } from "@/domain/week-scope";
import { listClientOrders } from "@/features/orders/server/orders.repo";
import { listClients } from "./clients.repo";

// Lista de clientes con lo que debe cada uno, filtrada y ordenada.
// Con `week` (una semana pasada elegida) solo cuentan los pedidos de esa semana y salen únicamente
// los clientes que compraron en ella; sin `week` (semana actual) es la lista de siempre.
export async function getClientsOverview(query: string, sort: ClientSort, week: Week | null = null, now: Date = new Date()) {
  const [clients, orders] = await Promise.all([listClients(), listClientOrders()]);
  const built = buildClientRows(clients, scopeOrders(orders, week), now);
  const rows = sortClientRows(filterClientRows(week ? built.filter((r) => r.orders > 0) : built, query), sort);
  return { rows, totalPorCobrar: rows.reduce((s, r) => s + r.debe, 0) };
}
