import "server-only";
import type { Order, Payment } from "@/domain/order";
import { NotFoundError } from "@/server/errors";
import { getOrder } from "./orders.repo";
import { listPaymentsOfOrder } from "./payments.repo";

// Un pedido con todos sus abonos (también los anulados, para verlos tachados).
// Antes de la migración 005 los abonos no traen `voided_at` y todos están vigentes.
export async function getOrderDetail(id: string): Promise<{ order: Order; payments: Payment[] }> {
  const order = await getOrder(id);
  if (!order) throw new NotFoundError("Pedido no encontrado");
  return { order, payments: await listPaymentsOfOrder(id) };
}
