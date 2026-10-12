import type { Client } from "./client";
import { remainingOf, type Order } from "./order";
import { activeOnly } from "./void";

export type ClientOrder = Pick<
  Order,
  "client_id" | "total" | "amount_paid" | "payment_status" | "created_at" | "voided_at"
>;

export interface ClientRow {
  id: string;
  name: string;
  phone: string | null;
  credit: number;
  debe: number;
  orders: number;
  lastOrderAt: string | null;
  daysInDebt: number | null;
}

export const CLIENT_SORTS = ["deuda", "antigua", "nombre", "pedidos"] as const;
export type ClientSort = (typeof CLIENT_SORTS)[number];

const DAY_MS = 24 * 60 * 60 * 1000;

interface Totals {
  debe: number;
  orders: number;
  last: string;
  oldestDebt: string | null;
}

// Una fila por cliente con lo que debe, cuántos pedidos tiene y desde cuándo debe.
export function buildClientRows(clients: Client[], orders: ClientOrder[], now: Date): ClientRow[] {
  const totals = new Map<string, Totals>();
  for (const o of activeOnly(orders)) {
    if (!o.client_id) continue;
    const t = totals.get(o.client_id) ?? { debe: 0, orders: 0, last: o.created_at, oldestDebt: null };
    t.orders += 1;
    if (o.created_at > t.last) t.last = o.created_at;
    if (o.payment_status !== "pagado") {
      t.debe += Math.max(Number(o.total) - Number(o.amount_paid), 0);
      if (!t.oldestDebt || o.created_at < t.oldestDebt) t.oldestDebt = o.created_at;
    }
    totals.set(o.client_id, t);
  }

  return clients.map((c) => {
    const t = totals.get(c.id);
    return {
      id: c.id,
      name: c.name,
      phone: c.phone,
      credit: Number(c.credit_balance),
      debe: t?.debe ?? 0,
      orders: t?.orders ?? 0,
      lastOrderAt: t?.last ?? null,
      daysInDebt: t?.oldestDebt
        ? Math.floor((now.getTime() - new Date(t.oldestDebt).getTime()) / DAY_MS)
        : null,
    };
  });
}

export function filterClientRows(rows: ClientRow[], query: string): ClientRow[] {
  const q = query.trim().toLowerCase();
  if (!q) return rows;
  return rows.filter((r) => r.name.toLowerCase().includes(q) || (r.phone ?? "").includes(q));
}

export function sortClientRows(rows: ClientRow[], sort: ClientSort): ClientRow[] {
  const byName = (a: ClientRow, b: ClientRow) => a.name.localeCompare(b.name, "es");
  const compare: Record<ClientSort, (a: ClientRow, b: ClientRow) => number> = {
    nombre: byName,
    pedidos: (a, b) => b.orders - a.orders || byName(a, b),
    antigua: (a, b) => (b.daysInDebt ?? -1) - (a.daysInDebt ?? -1) || byName(a, b),
    deuda: (a, b) => b.debe - a.debe || byName(a, b),
  };
  return [...rows].sort(compare[sort]);
}

// Resumen de los pedidos vigentes de un cliente (los anulados no cuentan).
export function summarizeClientOrders(
  orders: Pick<Order, "total" | "amount_paid" | "voided_at">[]
): { debe: number; comprado: number; count: number } {
  const active = activeOnly(orders);
  return {
    debe: active.reduce((s, o) => s + remainingOf(o), 0),
    comprado: active.reduce((s, o) => s + Number(o.total), 0),
    count: active.length,
  };
}
