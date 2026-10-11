import { created, handle, parseJson } from "@/server/http";
import { createProviderDiscountSchema } from "@/features/purchases/schemas";
import { createProviderDiscount } from "@/features/purchases/server/create-provider-discount";

export const POST = handle(async (request) => {
  const input = await parseJson(request, createProviderDiscountSchema);
  return created({ discount: await createProviderDiscount(input) });
});
