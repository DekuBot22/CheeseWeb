import "server-only";
import { applyPayment } from "@/domain/order";
import { NotFoundError } from "@/server/errors";
import { addCredit } from "@/features/clients/server/clients.repo";
import { getOrder, updateOrderPayment } from "./orders.repo";
import { rpcRegisterPayment } from "./order-rpc.repo";
import { insertPayment } from "./payments.repo";

// Registra un abono: lo aplica al pedido y, si sobra, lo suma como saldo a
// favor del cliente. Con la migración 005 es una sola operación atómica en la
// base; sin ella, cae al camino viejo de 3 escrituras seguidas (sin transacción).
export async function registerPayment(
  orderId: string,
  amount: number,
  method: string | null,
  createdAt?: string
) {
  const atomic = await rpcRegisterPayment(orderId, amount, method, createdAt);
  if (atomic) return atomic;

  const order = await getOrder(orderId);
  if (!order) throw new NotFoundError("Pedido no encontrado");

  const applied = applyPayment(order, amount);
  await insertPayment({ order_id: orderId, amount, method, created_at: createdAt });
  const updated = await updateOrderPayment(orderId, {
    amount_paid: applied.newAmountPaid,
    payment_status: applied.paymentStatus,
  });

  if (applied.creditToAdd > 0 && order.client_id) {
    await addCredit(order.client_id, applied.creditToAdd);
  }
  return { order: updated, creditAdded: applied.creditToAdd };
}
