import { created, handle, parseJson } from "@/server/http";
import { createProviderPaymentSchema } from "@/features/purchases/schemas";
import { insertProviderPayment } from "@/features/purchases/server/provider-payments.repo";

export const POST = handle(async (request) => {
  const input = await parseJson(request, createProviderPaymentSchema);
  return created({ payment: await insertProviderPayment(input) });
});
