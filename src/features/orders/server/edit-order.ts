import "server-only";
import { saleTimestamp, type Order } from "@/domain/order";
import { isVoided } from "@/domain/void";
import { bogotaDate } from "@/lib/bogota-time";
import { NotFoundError, ValidationError } from "@/server/errors";
import { findOrCreateClient } from "@/features/clients/server/clients.repo";
import type { EditOrderInput } from "../schemas";
import { rpcEditOrder } from "./order-rpc.repo";
import { getOrder, updateOrderFields, type OrderFieldsPatch } from "./orders.repo";

// Cambia cliente, cantidad, total, queso, sal, estado, fecha y nota de un pedido.
// Los abonos siguen al pedido y la base recalcula el cobro y mueve el saldo a
// favor de forma atómica.
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
  const creditDelta = Number(result.credit_delta ?? 0);
  // Lo que no mueve dinero va aparte de la función SQL: solo se toca lo que cambió.
  const patch = changedFields(current, input);
  if (Object.keys(patch).length === 0) return { order: result.order, creditDelta };
  return { order: await updateOrderFields(id, patch), creditDelta };
}

function changedFields(current: Order, input: EditOrderInput): OrderFieldsPatch {
  const patch: OrderFieldsPatch = {};
  if (input.note !== undefined && input.note !== (current.note ?? null)) patch.note = input.note;
  if (input.cheese_type && input.cheese_type !== current.cheese_type) patch.cheese_type = input.cheese_type;
  if (input.salt_level && input.salt_level !== current.salt_level) patch.salt_level = input.salt_level;
  if (input.status && input.status !== current.status) patch.status = input.status;
  // Misma fecha de Bogotá → se conserva la hora original.
  if (input.date && input.date !== bogotaDate(new Date(current.created_at))) {
    patch.created_at = saleTimestamp(input.date, new Date());
  }
  return patch;
}
