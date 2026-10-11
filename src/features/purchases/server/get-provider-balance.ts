import "server-only";
import { providerTotals } from "@/domain/provider-ledger";
import { listProviderPayments } from "./provider-payments.repo";
import { listPurchases } from "./purchases.repo";

// Lo que se le debe al proveedor: todas las compras menos todos los pagos.
export async function getProviderBalance() {
  const [purchases, payments] = await Promise.all([listPurchases(), listProviderPayments()]);
  return {
    ...providerTotals(purchases, payments),
    lastPurchaseDate: purchases.length ? purchases[purchases.length - 1].purchase_date : null,
  };
}
