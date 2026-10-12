import type { Order } from "./order";
import { isVoided } from "./void";

export type OpenOrder = Pick<
  Order,
  "id" | "client_id" | "client_name" | "total" | "amount_paid" | "created_at" | "voided_at"
>;

export interface Debtor {
  clientId: string | null;
  name: string;
  owed: number;
  oldestAt: string;
  days: number;
  openOrders: number;
}

export const AGING_LABELS = ["0–7 días", "8–14 días", "15–30 días", "Más de 30 días"] as const;

const DAY_MS = 24 * 60 * 60 * 1000;

function agingBucket(days: number): number {
  if (days <= 7) return 0;
  if (days <= 14) return 1;
  if (days <= 30) return 2;
  return 3;
}

// Cuentas por cobrar: quién debe, cuánto y desde hace cuánto, más la deuda
// repartida por antigüedad del pedido.
export function receivables(
  openOrders: OpenOrder[],
  now: Date = new Date()
): { total: number; debtors: Debtor[]; aging: { label: string; amount: number }[] } {
  const byClient = new Map<string, Debtor>();
  const aging = [0, 0, 0, 0];
  let total = 0;

  for (const o of openOrders) {
    if (isVoided(o)) continue;
    const remaining = Math.max(Number(o.total) - Number(o.amount_paid), 0);
    if (remaining <= 0) continue;
    total += remaining;

    const days = Math.max(Math.floor((now.getTime() - new Date(o.created_at).getTime()) / DAY_MS), 0);
    aging[agingBucket(days)] += remaining;

    const key = o.client_id ?? `nombre:${o.client_name}`;
    const current = byClient.get(key);
    if (!current) {
      byClient.set(key, {
        clientId: o.client_id,
        name: o.client_name,
        owed: remaining,
        oldestAt: o.created_at,
        days,
        openOrders: 1,
      });
    } else {
      current.owed += remaining;
      current.openOrders += 1;
      if (o.created_at < current.oldestAt) {
        current.oldestAt = o.created_at;
        current.days = days;
      }
    }
  }

  return {
    total,
    debtors: [...byClient.values()].sort((a, b) => b.owed - a.owed),
    aging: AGING_LABELS.map((label, i) => ({ label, amount: aging[i] })),
  };
}
