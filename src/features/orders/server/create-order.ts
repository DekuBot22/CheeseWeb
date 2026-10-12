import "server-only";
import { priceOrder, type Order } from "@/domain/order";
import { AppError } from "@/server/errors";
import { findOrCreateClient } from "@/features/clients/server/clients.repo";
import { getPricing } from "@/features/settings/server/settings.repo";
import type { CreateOrderInput } from "../schemas";
import { buildOrderRow } from "./build-order-row";
import { notifyNewOrder } from "./notify-new-order";
import { insertOrder } from "./orders.repo";

// Pedido nuevo de un cliente: fija el precio vigente, busca o crea al cliente,
// guarda el pedido y avisa al dueño.
export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const pricing = await getPricing();
  if (!pricing) throw new AppError("No se pudo obtener el precio actual. Intenta más tarde.");

  const priced = priceOrder(
    { amount: input.amount, quantity: input.quantity, unit: input.unit },
    pricing.pricePerKg
  );
  const clientId = await findOrCreateClient(input.client_name);

  const order = await insertOrder(
    buildOrderRow({ ...input, ...priced }, pricing, clientId)
  );

  await notifyNewOrder(order, input.amount !== undefined);
  return order;
}
