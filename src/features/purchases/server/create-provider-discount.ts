import "server-only";
import { remainingForDiscount } from "@/domain/provider-ledger";
import type { ProviderDiscount } from "@/domain/purchase";
import { isVoided } from "@/domain/void";
import { formatCOP } from "@/lib/format";
import { NotFoundError, ValidationError } from "@/server/errors";
import type { CreateProviderDiscountInput } from "../schemas";
import { insertProviderDiscount, listDiscountsOfPurchase } from "./provider-discounts.repo";
import { getPurchase } from "./purchases.repo";

// Registra un descuento del proveedor. Si va ligado a una compra, el total
// descontado de esa compra no puede superar lo que costó.
export async function createProviderDiscount(input: CreateProviderDiscountInput): Promise<ProviderDiscount> {
  if (input.purchase_id) {
    const purchase = await getPurchase(input.purchase_id);
    if (!purchase || isVoided(purchase)) throw new NotFoundError("Compra no encontrada");

    const remaining = remainingForDiscount(purchase, await listDiscountsOfPurchase(purchase.id));
    if (input.amount > remaining) {
      throw new ValidationError(`El descuento supera lo que queda de esa compra (máx. ${formatCOP(remaining)})`);
    }
  }
  return insertProviderDiscount(input);
}
