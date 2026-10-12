import "server-only";
import { providerTotals } from "@/domain/provider-ledger";
import { activeOnly } from "@/domain/void";
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
  const active = activeOnly(purchases);
  return {
    ...providerTotals(purchases, payments, discounts),
    lastPurchaseDate: active.length ? active[active.length - 1].purchase_date : null,
  };
}
