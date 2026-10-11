import "server-only";
import { applyPayment } from "@/domain/order";
import { NotFoundError } from "@/server/errors";
import { addCredit } from "@/features/clients/server/clients.repo";
import { getOrder, updateOrderPayment } from "./orders.repo";
import { insertPayment } from "./payments.repo";

// Registra un abono: lo aplica al pedido y, si sobra, lo suma como saldo a
// favor del cliente. Son 3 escrituras seguidas (no hay transacción).
export async function registerPayment(orderId: string, amount: number, method: string | null) {
  const order = await getOrder(orderId);
  if (!order) throw new NotFoundError("Pedido no encontrado");

  const applied = applyPayment(order, amount);
  await insertPayment({ order_id: orderId, amount, method });
  const updated = await updateOrderPayment(orderId, {
    amount_paid: applied.newAmountPaid,
    payment_status: applied.paymentStatus,
  });

  if (applied.creditToAdd > 0 && order.client_id) {
    await addCredit(order.client_id, applied.creditToAdd);
  }
  return { order: updated, creditAdded: applied.creditToAdd };
}
