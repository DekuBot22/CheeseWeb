import "server-only";
import { discountedPricePerKg, priceOrder, saleTimestamp, type Order } from "@/domain/order";
import { AppError, ValidationError } from "@/server/errors";
import { findOrCreateClient } from "@/features/clients/server/clients.repo";
import { getPricing } from "@/features/settings/server/settings.repo";
import type { CreateSaleInput } from "../schemas";
import { buildOrderRow } from "./build-order-row";
import { insertOrder } from "./orders.repo";
import { registerPayment } from "./register-payment";

// Venta que el dueño registra desde el panel (WhatsApp, en persona…). Usa el precio
// vigente, no avisa por Telegram (la registra él mismo) y puede quedar ya pagada.
// Si el pedido se guarda pero el abono falla, devuelve `paymentError` en vez de
// perder la venta: el abono se registra después desde Pedidos.
export async function createSale(input: CreateSaleInput): Promise<{ order: Order; paymentError?: string }> {
  const pricing = await getPricing();
  if (!pricing) throw new AppError("No se pudo obtener el precio actual. Intenta más tarde.");

  // El descuento solo existe en ventas por cantidad y queda dentro del precio por kg
  // congelado en el pedido (así la ganancia de esa venta sale bien sin columnas nuevas).
  const salePricePerKg =
    input.mode === "cantidad" && input.discount
      ? discountedPricePerKg(pricing.pricePerKg, input.discount, input.unit)
      : pricing.pricePerKg;
  if (salePricePerKg <= 0) throw new ValidationError("El descuento no puede ser igual o mayor al precio");

  const priced =
    input.mode === "valor"
      ? priceOrder({ amount: input.amount, quantity: 0, unit: "kg" }, salePricePerKg)
      : priceOrder({ quantity: input.quantity ?? 0, unit: input.unit }, salePricePerKg);

  const createdAt = saleTimestamp(input.date, new Date());
  const clientId = await findOrCreateClient(input.client_name);
  const order = await insertOrder(
    buildOrderRow({ ...input, ...priced }, { ...pricing, pricePerKg: salePricePerKg }, clientId, input.date ? createdAt : undefined)
  );

  if (!input.paid) return { order };
  try {
    const paid = await registerPayment(order.id, order.total, input.method, createdAt);
    return { order: paid.order };
  } catch (err) {
    console.error(err);
    return { order, paymentError: "Venta guardada, pero el abono no se registró: regístralo desde Pedidos." };
  }
}
