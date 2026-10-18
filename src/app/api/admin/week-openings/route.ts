import { created, handle, parseJson } from "@/server/http";
import { openWeekSchema } from "@/features/weeks/schemas";
import { openWeek } from "@/features/weeks/server/manage-week-openings";

export const POST = handle(async (request) => {
  const input = await parseJson(request, openWeekSchema);
  return created({ opening: await openWeek(input) });
});
