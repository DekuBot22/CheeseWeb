import type { Voidable } from "./void";

export interface Purchase extends Voidable {
  id: string;
  purchase_date: string;
  kg: number;
  total_cost: number;
  description: string | null;
  created_at: string;
}

export interface ProviderPayment extends Voidable {
  id: string;
  payment_date: string;
  amount: number;
  method: string | null;
  notes: string | null;
  created_at: string;
}

// Motivos rápidos de un descuento del proveedor (nota crédito).
export const DISCOUNT_REASONS = ["salado", "mal_estado", "faltante", "otro"] as const;
export type DiscountReason = (typeof DISCOUNT_REASONS)[number];

export const DISCOUNT_REASON_LABELS: Record<DiscountReason, string> = {
  salado: "Queso salado",
  mal_estado: "Mal estado",
  faltante: "Faltante de peso",
  otro: "Otro",
};

// Rebaja que el proveedor le hace al dueño sobre lo que le debe. No edita la
// compra original: es un movimiento propio, como un pago, para dejar trazabilidad.
export interface ProviderDiscount extends Voidable {
  id: string;
  discount_date: string;
  amount: number;
  reason: DiscountReason;
  purchase_id: string | null;
  kg: number | null;
  notes: string | null;
  created_at: string;
}
