import type { CheeseType, SaltLevel } from "./catalog";
import { toKg, type Unit } from "./units";

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
}

export interface Payment {
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
  const total = Number(order.total);
  const appliedToOrder = Math.min(amount, remainingOf(order));
  const newAmountPaid = Number(order.amount_paid) + appliedToOrder;

  let paymentStatus: PaymentStatus = "debe";
  if (newAmountPaid + PAID_TOLERANCE >= total) paymentStatus = "pagado";
  else if (newAmountPaid > 0) paymentStatus = "parcial";

  return { appliedToOrder, creditToAdd: amount - appliedToOrder, newAmountPaid, paymentStatus };
}
