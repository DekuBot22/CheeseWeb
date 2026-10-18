import "server-only";
import { computeStats, withCostFallback } from "@/domain/accounting";
import { receivables } from "@/domain/receivables";
import { activeOnly } from "@/domain/void";
import { weekOf, weeksSince } from "@/domain/week-calendar";
import { bogotaDate } from "@/lib/bogota-time";
import { listClients } from "@/features/clients/server/clients.repo";
import { listOpenOrders, listOrdersInRange } from "@/features/orders/server/orders.repo";
import { listPaymentsInRange } from "@/features/orders/server/payments.repo";
import { listProviderDiscountsInRange } from "@/features/purchases/server/provider-discounts.repo";
import { listProviderPaymentsInRange } from "@/features/purchases/server/provider-payments.repo";
import { listPurchasesInRange } from "@/features/purchases/server/purchases.repo";
import { getPricing } from "@/features/settings/server/settings.repo";
import { getWeekCalendar } from "@/features/weeks/server/get-week-calendar";
import { fetchWeekOpenings } from "@/features/weeks/server/week-openings.repo";
import { buildVoidedRows } from "../voided-rows";

// Tope de semanas que lista el Excel (unos 5 años).
const MAX_WEEKS = 260;

// Datos del Excel: todo lo vigente del rango pedido, la deuda actual por cliente
// y, aparte, lo anulado (no cuenta en las cifras pero queda a la vista).
export async function getExportData(start: Date, end: Date) {
  // Fechas en hora de Colombia: el fin de una semana es el viernes, no el sábado siguiente.
  const startDate = bogotaDate(start);
  const endDate = bogotaDate(end);

  const [allOrders, allPurchases, allPayments, allDiscounts, openOrders, clientPayments, clients, pricing, openings, cal] =
    await Promise.all([
      listOrdersInRange(start, end),
      listPurchasesInRange(startDate, endDate),
      listProviderPaymentsInRange(startDate, endDate),
      listProviderDiscountsInRange(startDate, endDate),
      listOpenOrders(),
      listPaymentsInRange(start, end),
      listClients(),
      getPricing(),
      fetchWeekOpenings(),
      getWeekCalendar(),
    ]);

  // Semanas del rango; con "todo el tiempo" (inicio en 1970) arranca en el primer pedido.
  const first = start.getTime() === 0 && allOrders[0] ? new Date(allOrders[0].created_at) : start;
  const weeks = weeksSince(cal, first, weekOf(cal, end), MAX_WEEKS);
  const weekOpenings = openings.openings.filter((o) => o.start_date >= startDate && o.start_date <= endDate);

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
    weeks,
    weekNotes: new Map(activeOnly(weekOpenings).map((o) => [o.start_date, o.note ?? ""])),
    voided: buildVoidedRows({
      weekOpenings,
      orders: allOrders,
      payments: clientPayments,
      purchases: allPurchases,
      providerPayments: allPayments,
      discounts: allDiscounts,
    }),
    stats: computeStats(withCostFallback(orders, pricing?.costPerKg ?? 0), purchases, payments, discounts),
    debtors: receivables(openOrders).debtors,
  };
}

export type ExportData = Awaited<ReturnType<typeof getExportData>>;
