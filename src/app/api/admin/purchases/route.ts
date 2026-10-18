import { created, handle, parseJson } from "@/server/http";
import { createPurchaseSchema } from "@/features/purchases/schemas";
import { createPurchase } from "@/features/purchases/server/create-purchase";

export const POST = handle(async (request) => {
  const input = await parseJson(request, createPurchaseSchema);
  return created(await createPurchase(input));
});
