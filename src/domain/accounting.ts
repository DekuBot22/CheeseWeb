import { formatWeekShort } from "@/lib/format";
import { buildCalendar, currentWeek, lastWeeks, type Week } from "./week-calendar";
import { toKg } from "./units";
import type { Order } from "./order";
import type { ProviderDiscount, ProviderPayment, Purchase } from "./purchase";
import { activeOnly } from "./void";

// Solo las columnas que realmente usa la contabilidad: así las consultas
// pueden traer menos datos y los tipos lo reflejan.
export type StatOrder = Pick<
  Order,
  "quantity" | "unit" | "total" | "amount_paid" | "cost_per_kg_snapshot" | "created_at" | "voided_at"
>;
export type StatPurchase = Pick<Purchase, "kg" | "total_cost" | "purchase_date" | "voided_at">;
export type StatPayment = Pick<ProviderPayment, "amount" | "payment_date" | "voided_at">;
export type StatDiscount = Pick<ProviderDiscount, "amount" | "discount_date" | "voided_at">;

// Los conjuntos de datos que alimentan la contabilidad de un período.
// `discounts` es opcional: si la tabla aún no existe, simplemente no hay descuentos.
export interface PeriodData {
  orders: StatOrder[];
  purchases: StatPurchase[];
  providerPayments: StatPayment[];
  discounts?: StatDiscount[];
  // Costo por kg de Ajustes: se usa en los pedidos que se guardaron con costo 0
  // (antes de que el dueño lo configurara).
  fallbackCostPerKg?: number;
}

export interface PeriodStats {
  revenue: number;
  collected: number;
  comprado: number;
  descontado: number;
  pagadoProveedor: number;
  saldoProveedor: number;
  // Costo de lo que ya se cobró (kg × costo por kg × fracción pagada).
  cost: number;
  // Kilos que corresponden a lo ya cobrado (para la ganancia por libra).
  kgPaid: number;
  // Ganancia = cobrado − cost. El proveedor (compras, descuentos, pagos) no entra.
  profit: number;
  // Ganancia sobre lo cobrado.
  margin: number;
}

// Fracción de un pedido que ya se pagó (0 a 1).
function paidFraction(o: Pick<Order, "total" | "amount_paid">): number {
  const total = Number(o.total);
  return total > 0 ? Math.min(Number(o.amount_paid) / total, 1) : 0;
}

// Costo de la parte ya cobrada de un pedido, en pesos enteros: se redondea hacia
// arriba para no inflar la ganancia (abono de 3.000 sobre 26.000 con costo 22.000
// → costo 2.539, ganancia 461 y no 461,54). Los pedidos pagados completos o con
// libras exactas ya dan pesos enteros y no cambian.
export function costOfPaid(o: Pick<Order, "quantity" | "unit" | "total" | "amount_paid" | "cost_per_kg_snapshot">): number {
  const raw = toKg(Number(o.quantity), o.unit) * Number(o.cost_per_kg_snapshot) * paidFraction(o);
  // toFixed quita el ruido de coma flotante (44000.0000000001 no debe subir a 44001).
  return Math.ceil(Number(raw.toFixed(6)));
}

// Los pedidos guardados con costo 0 (antes de configurarlo en Ajustes) toman el
// costo por kg vigente.
export function withCostFallback(orders: StatOrder[], costPerKg: number): StatOrder[] {
  if (costPerKg <= 0) return orders;
  return orders.map((o) => (Number(o.cost_per_kg_snapshot) > 0 ? o : { ...o, cost_per_kg_snapshot: costPerKg }));
}

// Lo anulado (pedidos, compras, pagos y descuentos) no cuenta en nada.
// La ganancia solo mira a los clientes: lo cobrado menos el costo de esa parte.
// Lo del proveedor se calcula aparte y no la afecta.
export function computeStats(
  allOrders: StatOrder[],
  allPurchases: StatPurchase[],
  allPayments: StatPayment[],
  allDiscounts: StatDiscount[] = []
): PeriodStats {
  const orders = activeOnly(allOrders);
  const purchases = activeOnly(allPurchases);
  const providerPayments = activeOnly(allPayments);
  const discounts = activeOnly(allDiscounts);
  const revenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const collected = orders.reduce((sum, o) => sum + Number(o.amount_paid), 0);

  const comprado = purchases.reduce((sum, p) => sum + Number(p.total_cost), 0);
  const descontado = discounts.reduce((sum, d) => sum + Number(d.amount), 0);
  const pagadoProveedor = providerPayments.reduce((sum, p) => sum + Number(p.amount), 0);

  const cost = orders.reduce((sum, o) => sum + costOfPaid(o), 0);
  const kgPaid = orders.reduce((sum, o) => sum + toKg(Number(o.quantity), o.unit) * paidFraction(o), 0);
  const profit = collected - cost;
  const margin = collected > 0 ? (profit / collected) * 100 : 0;

  return {
    revenue,
    collected,
    comprado,
    descontado,
    pagadoProveedor,
    saldoProveedor: comprado - descontado - pagadoProveedor,
    cost,
    kgPaid,
    profit,
    margin,
  };
}

export function kgSold(orders: Pick<Order, "quantity" | "unit" | "voided_at">[]): number {
  return activeOnly(orders).reduce((sum, o) => sum + toKg(Number(o.quantity), o.unit), 0);
}

// Variación porcentual; null cuando no hay base de comparación.
export function percentChange(curr: number, prev: number): number | null {
  if (prev === 0) return null;
  return ((curr - prev) / Math.abs(prev)) * 100;
}

export interface WeekPoint {
  start: Date;
  end: Date;
  // Días que abarca la semana (7 con la regla sábado→viernes; distinto si se abrió a mano).
  days: number;
  manual: boolean;
  label: string;
  stats: PeriodStats;
  orderCount: number;
  kgSold: number;
  kgBought: number;
}

function buildWeek({ start, end, from, to, days, manual }: Week, data: PeriodData): WeekPoint {
  const weekOrders = withCostFallback(
    data.orders.filter((o) => {
      const t = new Date(o.created_at).getTime();
      return t >= start.getTime() && t <= end.getTime();
    }),
    data.fallbackCostPerKg ?? 0
  );
  const weekPurchases = data.purchases.filter((p) => p.purchase_date >= from && p.purchase_date <= to);
  const weekPayments = data.providerPayments.filter((p) => p.payment_date >= from && p.payment_date <= to);
  const weekDiscounts = (data.discounts ?? []).filter((d) => d.discount_date >= from && d.discount_date <= to);

  return {
    start,
    end,
    days,
    manual,
    label: formatWeekShort(start),
    stats: computeStats(weekOrders, weekPurchases, weekPayments, weekDiscounts),
    orderCount: weekOrders.length,
    kgSold: kgSold(weekOrders),
    kgBought: weekPurchases.reduce((sum, p) => sum + Number(p.kg), 0),
  };
}

// Semana sin pedidos, compras ni movimientos del proveedor (todas sus cifras en 0).
export function isEmptyWeek(p: WeekPoint): boolean {
  return p.orderCount === 0 && p.kgBought === 0 && Object.values(p.stats).every((v) => v === 0);
}

// Una fila por semana de negocio (la más antigua primero). `weeks` son semanas ya
// calculadas con el calendario; un número significa "las últimas N con la regla sábado→viernes".
export function weeklySeries(raw: PeriodData, weeks: Week[] | number, now: Date = new Date()): WeekPoint[] {
  const data: PeriodData = {
    orders: activeOnly(raw.orders),
    purchases: activeOnly(raw.purchases),
    providerPayments: activeOnly(raw.providerPayments),
    discounts: activeOnly(raw.discounts ?? []),
    fallbackCostPerKg: raw.fallbackCostPerKg,
  };
  if (typeof weeks === "number") {
    const cal = buildCalendar([], now);
    return lastWeeks(cal, weeks, currentWeek(cal)).map((week) => buildWeek(week, data));
  }
  return weeks.map((week) => buildWeek(week, data));
}

// Totales de varias semanas: suma lo que ya calculó cada una.
export function sumWeeks(points: WeekPoint[]): PeriodStats {
  const sum = (pick: (s: PeriodStats) => number) => points.reduce((total, p) => total + pick(p.stats), 0);
  const revenue = sum((s) => s.revenue);
  const cost = sum((s) => s.cost);
  const comprado = sum((s) => s.comprado);
  const descontado = sum((s) => s.descontado);
  const pagadoProveedor = sum((s) => s.pagadoProveedor);
  const collected = sum((s) => s.collected);
  const profit = collected - cost;
  return {
    revenue,
    collected,
    comprado,
    descontado,
    pagadoProveedor,
    saldoProveedor: comprado - descontado - pagadoProveedor,
    cost,
    kgPaid: sum((s) => s.kgPaid),
    profit,
    margin: collected > 0 ? (profit / collected) * 100 : 0,
  };
}
