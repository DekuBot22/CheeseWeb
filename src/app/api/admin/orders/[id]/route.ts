import { handle, ok, parseJson } from "@/server/http";
import { updateOrderStatusSchema } from "@/features/orders/schemas";
import { updateOrderStatus } from "@/features/orders/server/orders.repo";

type Context = { params: Promise<{ id: string }> };

export const PATCH = handle<Context>(async (request, { params }) => {
  const { id } = await params;
  const { status } = await parseJson(request, updateOrderStatusSchema);
  return ok({ order: await updateOrderStatus(id, status) });
});
