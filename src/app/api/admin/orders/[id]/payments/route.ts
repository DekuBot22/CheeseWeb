import { handle, ok, parseJson } from "@/server/http";
import { registerPaymentSchema } from "@/features/orders/schemas";
import { registerDatedPayment } from "@/features/orders/server/register-dated-payment";

type Context = { params: Promise<{ id: string }> };

export const POST = handle<Context>(async (request, { params }) => {
  const { id } = await params;
  const input = await parseJson(request, registerPaymentSchema);
  return ok(await registerDatedPayment(id, input));
});
