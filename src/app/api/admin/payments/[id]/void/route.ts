import { handle, ok, parseJson } from "@/server/http";
import { voidSchema } from "@/features/orders/schemas";
import { rpcVoidPayment } from "@/features/orders/server/order-rpc.repo";

type Context = { params: Promise<{ id: string }> };

// Anula un abono y devuelve el pedido ya recalculado.
export const POST = handle<Context>(async (request, { params }) => {
  const { id } = await params;
  const { reason } = await parseJson(request, voidSchema);
  const { order } = await rpcVoidPayment(id, reason);
  return ok({ order });
});
