import { handle, ok, parseJson } from "@/server/http";
import { voidSchema } from "@/features/orders/schemas";
import { voidPurchaseWithChecks } from "@/features/purchases/server/void-purchase";

type Context = { params: Promise<{ id: string }> };

export const POST = handle<Context>(async (request, { params }) => {
  const { id } = await params;
  const { reason } = await parseJson(request, voidSchema);
  return ok({ purchase: await voidPurchaseWithChecks(id, reason) });
});
