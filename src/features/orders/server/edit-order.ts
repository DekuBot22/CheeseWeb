import "server-only";
import type { Order } from "@/domain/order";
import { isVoided } from "@/domain/void";
import { NotFoundError, ValidationError } from "@/server/errors";
import { findOrCreateClient } from "@/features/clients/server/clients.repo";
import type { EditOrderInput } from "../schemas";
import { rpcEditOrder } from "./order-rpc.repo";
import { getOrder } from "./orders.repo";

// Cambia cliente, cantidad y total de un pedido. Los abonos siguen al pedido y
// la base recalcula el cobro y mueve el saldo a favor de forma atómica.
export async function editOrder(
  id: string,
  input: EditOrderInput
): Promise<{ order: Order; creditDelta: number }> {
  const current = await getOrder(id);
  if (!current) throw new NotFoundError("Pedido no encontrado");
  if (isVoided(current)) throw new ValidationError("Este pedido está anulado y no se puede editar");

  const clientId = await findOrCreateClient(input.client_name);
  const result = await rpcEditOrder(id, {
    client_id: clientId,
    client_name: input.client_name.trim(),
    quantity: input.quantity,
    unit: input.unit,
    total: input.total,
  });
  return { order: result.order, creditDelta: Number(result.credit_delta ?? 0) };
}
