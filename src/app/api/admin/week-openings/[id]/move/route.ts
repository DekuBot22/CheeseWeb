import { handle, ok, parseJson } from "@/server/http";
import { moveWeekSchema } from "@/features/weeks/schemas";
import { moveOpening } from "@/features/weeks/server/manage-week-openings";

type Context = { params: Promise<{ id: string }> };

export const POST = handle<Context>(async (request, { params }) => {
  const { id } = await params;
  const { start_date } = await parseJson(request, moveWeekSchema);
  return ok({ opening: await moveOpening(id, start_date) });
});
