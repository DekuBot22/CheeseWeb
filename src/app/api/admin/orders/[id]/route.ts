import { handle, ok, parseJson } from "@/server/http";
import { editOrderSchema, updateOrderStatusSchema } from "@/features/orders/schemas";
import { editOrder } from "@/features/orders/server/edit-order";
import { getOrderDetail } from "@/features/orders/server/get-order-detail";
import { updateOrderStatus } from "@/features/orders/server/orders.repo";

type Context = { params: Promise<{ id: string }> };

export const GET = handle<Context>(async (_request, { params }) => {
  const { id } = await params;
  return ok(await getOrderDetail(id));
});

export const PATCH = handle<Context>(async (request, { params }) => {
  const { id } = await params;
  const { status } = await parseJson(request, updateOrderStatusSchema);
  return ok({ order: await updateOrderStatus(id, status) });
});

export const PUT = handle<Context>(async (request, { params }) => {
  const { id } = await params;
  return ok(await editOrder(id, await parseJson(request, editOrderSchema)));
});
