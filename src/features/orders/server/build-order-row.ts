import type { CheeseType, SaltLevel } from "@/domain/catalog";
import type { Unit } from "@/domain/units";
import type { NewOrder } from "./orders.repo";

// Fila de un pedido nuevo (lo comparten el pedido público y la venta del panel).
export function buildOrderRow(
  order: {
    client_name: string;
    quantity: number;
    unit: Unit;
    total: number;
    cheese_type: CheeseType;
    salt_level: SaltLevel;
    note?: string | null;
  },
  pricing: { pricePerKg: number; costPerKg: number },
  clientId: string,
  createdAt?: string
): NewOrder {
  return {
    client_id: clientId,
    client_name: order.client_name.trim(),
    quantity: order.quantity,
    unit: order.unit,
    cheese_type: order.cheese_type,
    salt_level: order.salt_level,
    price_per_kg_snapshot: pricing.pricePerKg,
    cost_per_kg_snapshot: pricing.costPerKg,
    total: order.total,
    amount_paid: 0,
    payment_status: "debe",
    status: "pendiente",
    // Solo se manda si hay nota: así guardar sin nota sigue funcionando antes de la migración 006.
    ...(order.note ? { note: order.note } : {}),
    ...(createdAt ? { created_at: createdAt } : {}),
  };
}
