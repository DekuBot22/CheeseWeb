import "server-only";
import {
  buildClientRows,
  filterClientRows,
  sortClientRows,
  type ClientSort,
} from "@/domain/client-balance";
import { listClientOrders } from "@/features/orders/server/orders.repo";
import { listClients } from "./clients.repo";

// Lista de clientes con lo que debe cada uno, filtrada y ordenada.
export async function getClientsOverview(query: string, sort: ClientSort, now: Date = new Date()) {
  const [clients, orders] = await Promise.all([listClients(), listClientOrders()]);
  const rows = sortClientRows(filterClientRows(buildClientRows(clients, orders, now), query), sort);
  return { rows, totalPorCobrar: rows.reduce((s, r) => s + r.debe, 0) };
}
