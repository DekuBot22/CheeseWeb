import "server-only";
import { listClients } from "@/features/clients/server/clients.repo";
import { listAllOrders } from "@/features/orders/server/orders.repo";
import { listAllPayments } from "@/features/orders/server/payments.repo";
import { listProviderDiscounts } from "@/features/purchases/server/provider-discounts.repo";
import { listProviderPayments } from "@/features/purchases/server/provider-payments.repo";
import { listPurchases } from "@/features/purchases/server/purchases.repo";
import { getSettingsRow } from "@/features/settings/server/settings.repo";
import { fetchWeekOpenings } from "@/features/weeks/server/week-openings.repo";

// Copia fiel de todas las tablas (ids y filas anuladas incluidos): es lo que sirve
// para restaurar. El Excel es para leer; este JSON es para volver atrás.
export async function getBackupData(now: Date) {
  const [settings, clients, orders, payments, purchases, providerPayments, { discounts }, { openings }] = await Promise.all([
    getSettingsRow(),
    listClients(),
    listAllOrders(),
    listAllPayments(),
    listPurchases(),
    listProviderPayments(),
    listProviderDiscounts(),
    fetchWeekOpenings(),
  ]);

  const tables = {
    settings,
    clients,
    orders,
    payments,
    purchases,
    provider_payments: providerPayments,
    provider_discounts: discounts,
    week_openings: openings,
  };
  return {
    counts: { clients: clients.length, orders: orders.length, payments: payments.length, purchases: purchases.length },
    json: { version: 1, generated_at: now.toISOString(), tables },
  };
}
