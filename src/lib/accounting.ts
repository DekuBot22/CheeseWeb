import { toKg } from "./constants";
import type { Order, Purchase, ProviderPayment } from "./types";

export interface PeriodStats {
  revenue: number;
  collected: number;
  comprado: number;
  pagadoProveedor: number;
  saldoProveedor: number;
  cost: number;
  usingRealCost: boolean;
  profit: number;
  margin: number;
}

export function computeStats(
  orders: Order[],
  purchases: Purchase[],
  providerPayments: ProviderPayment[]
): PeriodStats {
  const revenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const collected = orders.reduce((sum, o) => sum + Number(o.amount_paid), 0);

  const comprado = purchases.reduce((sum, p) => sum + Number(p.total_cost), 0);
  const pagadoProveedor = providerPayments.reduce((sum, p) => sum + Number(p.amount), 0);

  const estimatedCost = orders.reduce(
    (sum, o) => sum + toKg(Number(o.quantity), o.unit) * Number(o.cost_per_kg_snapshot),
    0
  );

  const usingRealCost = purchases.length > 0;
  const cost = usingRealCost ? comprado : estimatedCost;
  const profit = revenue - cost;
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

  return {
    revenue,
    collected,
    comprado,
    pagadoProveedor,
    saldoProveedor: comprado - pagadoProveedor,
    cost,
    usingRealCost,
    profit,
    margin,
  };
}
