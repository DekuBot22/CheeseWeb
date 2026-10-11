import { handle, ok, parseJson } from "@/server/http";
import { registerPaymentSchema } from "@/features/orders/schemas";
import { registerPayment } from "@/features/orders/server/register-payment";

type Context = { params: Promise<{ id: string }> };

export const POST = handle<Context>(async (request, { params }) => {
  const { id } = await params;
  const { amount, method } = await parseJson(request, registerPaymentSchema);
  return ok(await registerPayment(id, amount, method));
});
