import { handle, ok, parseJson } from "@/server/http";
import { voidOrderSchema } from "@/features/orders/schemas";
import { rpcVoidOrder } from "@/features/orders/server/order-rpc.repo";

type Context = { params: Promise<{ id: string }> };

// Anular un pedido es definitivo: para corregirlo se anula y se registra de nuevo.
export const POST = handle<Context>(async (request, { params }) => {
  const { id } = await params;
  const { reason, void_payments } = await parseJson(request, voidOrderSchema);
  const { order } = await rpcVoidOrder(id, reason, void_payments);
  return ok({ order });
});
