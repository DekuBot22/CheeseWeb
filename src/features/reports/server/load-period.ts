import "server-only";
import { bogotaDate } from "@/lib/bogota-time";
import { listOrdersForStats } from "@/features/orders/server/orders.repo";
import { listProviderDiscountsForStats } from "@/features/purchases/server/provider-discounts.repo";
import { listProviderPaymentsForStats } from "@/features/purchases/server/provider-payments.repo";
import { listPurchasesForStats } from "@/features/purchases/server/purchases.repo";

// Pedidos, compras, pagos y descuentos del proveedor de un rango (end = null → hasta hoy).
export async function loadPeriod(start: Date, end: Date | null) {
  const from = bogotaDate(start);
  const to = end ? bogotaDate(end) : null;

  const [orders, purchases, providerPayments, discounts] = await Promise.all([
    listOrdersForStats(start, end),
    listPurchasesForStats(from, to),
    listProviderPaymentsForStats(from, to),
    listProviderDiscountsForStats(from, to),
  ]);
  return { orders, purchases, providerPayments, discounts };
}
