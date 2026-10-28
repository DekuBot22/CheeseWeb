// Cobro del mes por cliente. Los clientes fiados pagan por mes (unas 4 semanas juntas), así que en vez de
// mirar semana por semana esta vista suma, por cliente, lo que falta por cobrar de los pedidos de un mes y
// lo desglosa por semana. Es lo que falta cobrar HOY de esos pedidos, igual que "Quién me debe".

import { bogotaDate } from "@/lib/bogota-time";
import type { OpenOrder } from "./receivables";
import { isVoided } from "./void";
import { weekOf, type WeekCalendar } from "./week-calendar";

export interface CollectionWeek {
  from: string;
  to: string;
  owed: number;
  orders: number;
}

export interface CollectionRow {
  clientId: string | null;
  name: string;
  phone: string | null;
  // Lo que falta cobrar de los pedidos del mes.
  owed: number;
  orders: number;
  // Desglose por semana (la más vieja primero).
  weeks: CollectionWeek[];
  // Lo que además debe de meses anteriores (no entra en `owed`).
  earlierOwed: number;
}

export interface MonthlyCollection {
  month: string;
  rows: CollectionRow[];
  total: number;
  earlierTotal: number;
  // Meses con deuda más el actual, el más nuevo primero: para moverse entre meses.
  months: string[];
}

const remainingOf = (o: Pick<OpenOrder, "total" | "amount_paid">) => Math.max(Number(o.total) - Number(o.amount_paid), 0);
const monthOfOrder = (o: Pick<OpenOrder, "created_at">) => bogotaDate(new Date(o.created_at)).slice(0, 7);

export function monthlyCollection(
  openOrders: readonly OpenOrder[],
  phones: ReadonlyMap<string, string | null>,
  cal: WeekCalendar,
  month: string
): MonthlyCollection {
  const debts = openOrders.filter((o) => !isVoided(o) && remainingOf(o) > 0);
  const byClient = new Map<string, CollectionRow>();
  const row = (o: OpenOrder): CollectionRow => {
    const key = o.client_id ?? `nombre:${o.client_name}`;
    let r = byClient.get(key);
    if (!r) {
      r = { clientId: o.client_id, name: o.client_name, phone: o.client_id ? (phones.get(o.client_id) ?? null) : null, owed: 0, orders: 0, weeks: [], earlierOwed: 0 };
      byClient.set(key, r);
    }
    return r;
  };

  for (const o of debts) {
    const orderMonth = monthOfOrder(o);
    if (orderMonth > month) continue;
    const r = row(o);
    if (orderMonth < month) {
      r.earlierOwed += remainingOf(o);
      continue;
    }
    r.owed += remainingOf(o);
    r.orders++;
    const week = weekOf(cal, new Date(o.created_at));
    const slot = r.weeks.find((w) => w.from === week.from);
    if (slot) {
      slot.owed += remainingOf(o);
      slot.orders++;
    } else {
      r.weeks.push({ from: week.from, to: week.to, owed: remainingOf(o), orders: 1 });
    }
  }

  const rows = [...byClient.values()]
    .filter((r) => r.owed > 0)
    .map((r) => ({ ...r, weeks: r.weeks.sort((a, b) => a.from.localeCompare(b.from)) }))
    .sort((a, b) => b.owed - a.owed || a.name.localeCompare(b.name, "es"));

  const months = [...new Set([...debts.map(monthOfOrder), cal.today.slice(0, 7)])].sort().reverse();
  return {
    month,
    rows,
    total: rows.reduce((s, r) => s + r.owed, 0),
    earlierTotal: rows.reduce((s, r) => s + r.earlierOwed, 0),
    months,
  };
}
