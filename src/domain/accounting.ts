import { formatWeekShort } from "@/lib/format";
import { shiftWeek, weekDateRange, weekRange } from "./week";
import { toKg } from "./units";
import type { Order } from "./order";
import type { ProviderPayment, Purchase } from "./purchase";

// Solo las columnas que realmente usa la contabilidad: así las consultas
// pueden traer menos datos y los tipos lo reflejan.
export type StatOrder = Pick<
  Order,
  "quantity" | "unit" | "total" | "amount_paid" | "cost_per_kg_snapshot" | "created_at"
>;
export type StatPurchase = Pick<Purchase, "kg" | "total_cost" | "purchase_date">;
export type StatPayment = Pick<ProviderPayment, "amount" | "payment_date">;

// Los tres conjuntos de datos que alimentan la contabilidad de un período.
export interface PeriodData {
  orders: StatOrder[];
  purchases: StatPurchase[];
  providerPayments: StatPayment[];
}

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
  orders: StatOrder[],
  purchases: StatPurchase[],
  providerPayments: StatPayment[]
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

export function kgSold(orders: Pick<Order, "quantity" | "unit">[]): number {
  return orders.reduce((sum, o) => sum + toKg(Number(o.quantity), o.unit), 0);
}

// Variación porcentual; null cuando no hay base de comparación.
export function percentChange(curr: number, prev: number): number | null {
  if (prev === 0) return null;
  return ((curr - prev) / Math.abs(prev)) * 100;
}

export interface WeekPoint {
  start: Date;
  end: Date;
  label: string;
  stats: PeriodStats;
  orderCount: number;
  kgSold: number;
  kgBought: number;
}

function buildWeek(start: Date, end: Date, data: PeriodData): WeekPoint {
  const { from, to } = weekDateRange(start, end);
  const weekOrders = data.orders.filter((o) => {
    const t = new Date(o.created_at).getTime();
    return t >= start.getTime() && t <= end.getTime();
  });
  const weekPurchases = data.purchases.filter((p) => p.purchase_date >= from && p.purchase_date <= to);
  const weekPayments = data.providerPayments.filter((p) => p.payment_date >= from && p.payment_date <= to);

  return {
    start,
    end,
    label: formatWeekShort(start),
    stats: computeStats(weekOrders, weekPurchases, weekPayments),
    orderCount: weekOrders.length,
    kgSold: kgSold(weekOrders),
    kgBought: weekPurchases.reduce((sum, p) => sum + Number(p.kg), 0),
  };
}

// Una fila por semana de negocio (la más antigua primero). Cada semana usa su
// propio criterio de costo: compras reales si hubo, estimado si no.
export function weeklySeries(data: PeriodData, weeks: number, now: Date = new Date()): WeekPoint[] {
  const currentStart = weekRange(now).start.toISOString();
  const points: WeekPoint[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const { start, end } = weekRange(shiftWeek(currentStart, -i));
    points.push(buildWeek(start, end, data));
  }
  return points;
}

// Totales de varias semanas sumando cada semana con su propio criterio de
// costo. Calcular el período completo de un golpe mezclaría semanas con
// compras reales y semanas estimadas, y el costo saldría subestimado.
export function sumWeeks(points: WeekPoint[]): PeriodStats {
  const sum = (pick: (s: PeriodStats) => number) => points.reduce((total, p) => total + pick(p.stats), 0);
  const revenue = sum((s) => s.revenue);
  const cost = sum((s) => s.cost);
  const comprado = sum((s) => s.comprado);
  const pagadoProveedor = sum((s) => s.pagadoProveedor);
  const profit = revenue - cost;
  return {
    revenue,
    collected: sum((s) => s.collected),
    comprado,
    pagadoProveedor,
    saldoProveedor: comprado - pagadoProveedor,
    cost,
    usingRealCost: points.every((p) => p.stats.revenue === 0 || p.stats.usingRealCost),
    profit,
    margin: revenue > 0 ? (profit / revenue) * 100 : 0,
  };
}
