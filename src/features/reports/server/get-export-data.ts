import "server-only";
import { computeStats } from "@/domain/accounting";
import { receivables } from "@/domain/receivables";
import { bogotaDate } from "@/lib/bogota-time";
import { listOpenOrders, listOrdersInRange } from "@/features/orders/server/orders.repo";
import { listProviderPaymentsInRange } from "@/features/purchases/server/provider-payments.repo";
import { listPurchasesInRange } from "@/features/purchases/server/purchases.repo";

// Datos del Excel: todo lo del rango pedido más la deuda actual por cliente.
export async function getExportData(start: Date, end: Date) {
  // Fechas en hora de Colombia: el fin de una semana es el viernes, no el sábado siguiente.
  const startDate = bogotaDate(start);
  const endDate = bogotaDate(end);

  const [orders, purchases, payments, openOrders] = await Promise.all([
    listOrdersInRange(start, end),
    listPurchasesInRange(startDate, endDate),
    listProviderPaymentsInRange(startDate, endDate),
    listOpenOrders(),
  ]);

  return {
    startDate,
    endDate,
    orders,
    purchases,
    payments,
    stats: computeStats(orders, purchases, payments),
    debtors: receivables(openOrders).debtors,
  };
}

export type ExportData = Awaited<ReturnType<typeof getExportData>>;
