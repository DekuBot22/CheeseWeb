import "server-only";
import { paymentDateError, paymentTimestamp } from "@/domain/payment-date";
import { NotFoundError, ValidationError } from "@/server/errors";
import { getOrder } from "./orders.repo";
import { registerPayment } from "./register-payment";

// Registra un abono con la fecha que eligió el dueño (o ahora si no eligió). Solo cambia la fecha que
// se muestra del abono: en Ganancias sigue contando en la semana del pedido.
export async function registerDatedPayment(
  orderId: string,
  input: { amount: number; method: string | null; date?: string },
  now: Date = new Date()
) {
  if (!input.date) return registerPayment(orderId, input.amount, input.method);

  const order = await getOrder(orderId);
  if (!order) throw new NotFoundError("Pedido no encontrado");
  const error = paymentDateError(input.date, order.created_at, now);
  if (error) throw new ValidationError(error);
  return registerPayment(orderId, input.amount, input.method, paymentTimestamp(input.date, order.created_at, now));
}
