import "server-only";
import { bogotaDate } from "@/lib/bogota-time";
import { listOrdersForStats } from "@/features/orders/server/orders.repo";
import { listProviderPaymentsForStats } from "@/features/purchases/server/provider-payments.repo";
import { listPurchasesForStats } from "@/features/purchases/server/purchases.repo";

// Pedidos, compras y pagos al proveedor de un rango (end = null → hasta hoy).
export async function loadPeriod(start: Date, end: Date | null) {
  const from = bogotaDate(start);
  const to = end ? bogotaDate(end) : null;

  const [orders, purchases, providerPayments] = await Promise.all([
    listOrdersForStats(start, end),
    listPurchasesForStats(from, to),
    listProviderPaymentsForStats(from, to),
  ]);
  return { orders, purchases, providerPayments };
}
