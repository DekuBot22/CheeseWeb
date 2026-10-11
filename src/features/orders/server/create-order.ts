import "server-only";
import { priceOrder, type Order } from "@/domain/order";
import { AppError } from "@/server/errors";
import { findOrCreateClient } from "@/features/clients/server/clients.repo";
import { getPricing } from "@/features/settings/server/settings.repo";
import type { CreateOrderInput } from "../schemas";
import { notifyNewOrder } from "./notify-new-order";
import { insertOrder } from "./orders.repo";

// Pedido nuevo de un cliente: fija el precio vigente, busca o crea al cliente,
// guarda el pedido y avisa al dueño.
export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const pricing = await getPricing();
  if (!pricing) throw new AppError("No se pudo obtener el precio actual. Intenta más tarde.");

  const { quantity, unit, total } = priceOrder(
    { amount: input.amount, quantity: input.quantity, unit: input.unit },
    pricing.pricePerKg
  );
  const clientId = await findOrCreateClient(input.client_name);

  const order = await insertOrder({
    client_id: clientId,
    client_name: input.client_name.trim(),
    quantity,
    unit,
    cheese_type: input.cheese_type,
    salt_level: input.salt_level,
    price_per_kg_snapshot: pricing.pricePerKg,
    cost_per_kg_snapshot: pricing.costPerKg,
    total,
    amount_paid: 0,
    payment_status: "debe",
    status: "pendiente",
  });

  await notifyNewOrder(order, input.amount !== undefined);
  return order;
}
