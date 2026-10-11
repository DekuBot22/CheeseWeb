import "server-only";
import { CHEESE_TYPE_LABELS, SALT_LEVEL_LABELS } from "@/domain/catalog";
import type { Order } from "@/domain/order";
import { formatCOP } from "@/lib/format";
import { sendTelegramMessage } from "@/server/telegram";

// Aviso al dueño por Telegram cuando entra un pedido nuevo.
export async function notifyNewOrder(order: Order, byAmount: boolean): Promise<void> {
  await sendTelegramMessage(
    "🧀 <b>Nuevo pedido de queso</b>\n\n" +
      `Cliente: ${order.client_name}\n` +
      (byAmount
        ? `Pedido por valor: ${formatCOP(order.total)} (≈ ${order.quantity} kg)\n`
        : `Cantidad: ${order.quantity} ${order.unit}\n`) +
      `Tipo: ${CHEESE_TYPE_LABELS[order.cheese_type]}\n` +
      `Sal: ${SALT_LEVEL_LABELS[order.salt_level]}\n` +
      `Total: ${formatCOP(order.total)}\n` +
      `Fecha: ${new Date(order.created_at).toLocaleString("es-CO", { timeZone: "America/Bogota" })}`
  );
}
