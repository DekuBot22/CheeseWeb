import { created, handle, parseJson } from "@/server/http";
import { createPurchaseSchema } from "@/features/purchases/schemas";
import { insertPurchase } from "@/features/purchases/server/purchases.repo";

export const POST = handle(async (request) => {
  const input = await parseJson(request, createPurchaseSchema);
  return created({ purchase: await insertPurchase(input) });
});
