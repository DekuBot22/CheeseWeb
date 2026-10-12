import { handle, ok, parseJson } from "@/server/http";
import { voidSchema } from "@/features/orders/schemas";
import { voidProviderPayment } from "@/features/purchases/server/provider-payments.repo";

type Context = { params: Promise<{ id: string }> };

export const POST = handle<Context>(async (request, { params }) => {
  const { id } = await params;
  const { reason } = await parseJson(request, voidSchema);
  return ok({ payment: await voidProviderPayment(id, reason) });
});
