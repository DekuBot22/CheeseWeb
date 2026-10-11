import "server-only";
import { providerTotals } from "@/domain/provider-ledger";
import { listProviderDiscounts } from "./provider-discounts.repo";
import { listProviderPayments } from "./provider-payments.repo";
import { listPurchases } from "./purchases.repo";

// Lo que se le debe al proveedor: todas las compras menos todos los pagos y descuentos.
export async function getProviderBalance() {
  const [purchases, payments, { discounts }] = await Promise.all([
    listPurchases(),
    listProviderPayments(),
    listProviderDiscounts(),
  ]);
  return {
    ...providerTotals(purchases, payments, discounts),
    lastPurchaseDate: purchases.length ? purchases[purchases.length - 1].purchase_date : null,
  };
}
