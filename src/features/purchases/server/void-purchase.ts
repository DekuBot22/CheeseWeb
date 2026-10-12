import "server-only";
import { activeOnly } from "@/domain/void";
import type { Purchase } from "@/domain/purchase";
import { ValidationError } from "@/server/errors";
import { listDiscountsOfPurchase } from "./provider-discounts.repo";
import { voidPurchase } from "./purchases.repo";

// Anula una compra. Si tiene descuentos vigentes ligados, primero hay que
// anularlos: si no, el saldo con el proveedor quedaría con un descuento huérfano.
export async function voidPurchaseWithChecks(id: string, reason: string): Promise<Purchase> {
  const linked = activeOnly(await listDiscountsOfPurchase(id));
  if (linked.length > 0) {
    throw new ValidationError("Esta compra tiene descuentos ligados: anúlalos primero.");
  }
  return voidPurchase(id, reason);
}
