import type { CheeseType, SaltLevel } from "./catalog";
import { toKg, type Unit } from "./units";
import { bogotaDate } from "@/lib/bogota-time";
import { activeOnly, type Voidable } from "./void";

export type OrderStatus = "pendiente" | "completado";
export type PaymentStatus = "debe" | "parcial" | "pagado";

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  debe: "Debe",
  parcial: "Pago parcial",
  pagado: "Pagado",
};

export interface Order {
  id: string;
  client_id: string | null;
  client_name: string;
  quantity: number;
  unit: Unit;
  cheese_type: CheeseType;
  salt_level: SaltLevel;
  price_per_kg_snapshot: number;
  cost_per_kg_snapshot: number;
  total: number;
  amount_paid: number;
  payment_status: PaymentStatus;
  status: OrderStatus;
  created_at: string;
  // Antes de la migración 005 estas columnas no existen: por eso son opcionales.
  voided_at?: string | null;
  void_reason?: string | null;
  edited_at?: string | null;
}

export interface Payment extends Voidable {
  id: string;
  order_id: string;
  amount: number;
  method: string | null;
  created_at: string;
}

// Un pedido se considera pagado si falta un centavo o menos (errores de redondeo).
const PAID_TOLERANCE = 0.01;

// Límites del pedido por valor en pesos.
export const MIN_ORDER_AMOUNT = 1000;
export const MAX_ORDER_AMOUNT = 5_000_000;

// Lo que falta por cobrar de un pedido (nunca negativo).
export function remainingOf(order: Pick<Order, "total" | "amount_paid">): number {
  return Math.max(Number(order.total) - Number(order.amount_paid), 0);
}

export interface PricedOrder {
  quantity: number;
  unit: Unit;
  total: number;
}

// Cantidad, unidad y total de un pedido nuevo. Si viene `amount` (pedido por
// valor) se guardan los kg equivalentes (2 decimales, como el resto de
// pedidos) pero el total queda exacto en el valor que pidió el cliente.
export function priceOrder(
  input: { amount?: number; quantity: number; unit: Unit },
  pricePerKg: number
): PricedOrder {
  if (input.amount !== undefined) {
    return {
      quantity: Math.max(0.01, Math.round((input.amount / pricePerKg) * 100) / 100),
      unit: "kg",
      total: Math.round(input.amount),
    };
  }
  return {
    quantity: input.quantity,
    unit: input.unit,
    total: Math.round(toKg(input.quantity, input.unit) * pricePerKg),
  };
}

export interface Settlement {
  amountPaid: number;
  paymentStatus: PaymentStatus;
  // Lo abonado que no cabe en el pedido: pasa a saldo a favor del cliente.
  excess: number;
}

// Estado de cobro de un pedido a partir de la suma de sus abonos vigentes.
// Es el espejo de `sync_order_payment` y `order_credit_excess` en la migración
// 005: si cambias una regla aquí, cámbiala allá. Un pedido anulado no cobra
// nada: todo lo abonado que siga vigente queda como excedente.
export function settleOrder(total: number, paidSum: number, voided = false): Settlement {
  if (voided) return { amountPaid: 0, paymentStatus: "debe", excess: Math.max(paidSum, 0) };
  const amountPaid = Math.min(paidSum, total);
  let paymentStatus: PaymentStatus = "debe";
  if (amountPaid + PAID_TOLERANCE >= total) paymentStatus = "pagado";
  else if (amountPaid > 0) paymentStatus = "parcial";
  return { amountPaid, paymentStatus, excess: Math.max(paidSum - total, 0) };
}

export function sumActivePayments(payments: Pick<Payment, "amount" | "voided_at">[]): number {
  return activeOnly(payments).reduce((sum, p) => sum + Number(p.amount), 0);
}

export interface OrderEditPreview {
  before: Settlement;
  after: Settlement;
  // Cuánto saldo a favor se agrega (+) o se consume (−) del cliente.
  creditDelta: number;
}

// Qué pasaría con el cobro y el saldo a favor al cambiar el total de un pedido.
export function previewOrderEdit(
  current: { total: number; paidSum: number },
  nextTotal: number
): OrderEditPreview {
  const before = settleOrder(current.total, current.paidSum);
  const after = settleOrder(nextTotal, current.paidSum);
  return { before, after, creditDelta: after.excess - before.excess };
}

// Instante de una venta registrada desde el panel: hoy → ahora; un día pasado
// → ese día a las 12:00 de Bogotá (así no cae en otra semana por la zona horaria).
export function saleTimestamp(date: string | null | undefined, now: Date): string {
  if (!date || date >= bogotaDate(now)) return now.toISOString();
  return new Date(`${date}T12:00:00-05:00`).toISOString();
}

export interface AppliedPayment {
  appliedToOrder: number;
  creditToAdd: number;
  newAmountPaid: number;
  paymentStatus: PaymentStatus;
}

// Reparte un abono: lo que cubre el pedido y el excedente que queda como
// saldo a favor del cliente.
export function applyPayment(
  order: Pick<Order, "total" | "amount_paid">,
  amount: number
): AppliedPayment {
  const appliedToOrder = Math.min(amount, remainingOf(order));
  const { amountPaid, paymentStatus } = settleOrder(
    Number(order.total),
    Number(order.amount_paid) + appliedToOrder
  );
  return { appliedToOrder, creditToAdd: amount - appliedToOrder, newAmountPaid: amountPaid, paymentStatus };
}
