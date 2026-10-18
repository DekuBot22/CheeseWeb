import { handle, ok, parseJson } from "@/server/http";
import { voidSchema } from "@/features/orders/schemas";
import { voidOpening } from "@/features/weeks/server/manage-week-openings";

type Context = { params: Promise<{ id: string }> };

export const POST = handle<Context>(async (request, { params }) => {
  const { id } = await params;
  const { reason } = await parseJson(request, voidSchema);
  return ok({ opening: await voidOpening(id, reason) });
});
