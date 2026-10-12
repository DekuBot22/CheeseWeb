import "server-only";
import { computeStats } from "@/domain/accounting";
import { receivables } from "@/domain/receivables";
import { activeOnly } from "@/domain/void";
import { bogotaDate } from "@/lib/bogota-time";
import { listClients } from "@/features/clients/server/clients.repo";
import { listOpenOrders, listOrdersInRange } from "@/features/orders/server/orders.repo";
import { listPaymentsInRange } from "@/features/orders/server/payments.repo";
import { listProviderDiscountsInRange } from "@/features/purchases/server/provider-discounts.repo";
import { listProviderPaymentsInRange } from "@/features/purchases/server/provider-payments.repo";
import { listPurchasesInRange } from "@/features/purchases/server/purchases.repo";
import { buildVoidedRows } from "../voided-rows";

// Datos del Excel: todo lo vigente del rango pedido, la deuda actual por cliente
// y, aparte, lo anulado (no cuenta en las cifras pero queda a la vista).
export async function getExportData(start: Date, end: Date) {
  // Fechas en hora de Colombia: el fin de una semana es el viernes, no el sábado siguiente.
  const startDate = bogotaDate(start);
  const endDate = bogotaDate(end);

  const [allOrders, allPurchases, allPayments, allDiscounts, openOrders, clientPayments, clients] =
    await Promise.all([
      listOrdersInRange(start, end),
      listPurchasesInRange(startDate, endDate),
      listProviderPaymentsInRange(startDate, endDate),
      listProviderDiscountsInRange(startDate, endDate),
      listOpenOrders(),
      listPaymentsInRange(start, end),
      listClients(),
    ]);

  const orders = activeOnly(allOrders);
  const purchases = activeOnly(allPurchases);
  const payments = activeOnly(allPayments);
  const discounts = activeOnly(allDiscounts);

  return {
    startDate,
    endDate,
    orders,
    purchases,
    payments,
    discounts,
    clients,
    clientPayments: activeOnly(clientPayments),
    voided: buildVoidedRows({
      orders: allOrders,
      payments: clientPayments,
      purchases: allPurchases,
      providerPayments: allPayments,
      discounts: allDiscounts,
    }),
    stats: computeStats(orders, purchases, payments, discounts),
    debtors: receivables(openOrders).debtors,
  };
}

export type ExportData = Awaited<ReturnType<typeof getExportData>>;
