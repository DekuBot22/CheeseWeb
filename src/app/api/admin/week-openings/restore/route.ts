import { handle, ok, parseJson } from "@/server/http";
import { restoreOpeningsSchema } from "@/features/weeks/schemas";
import { restoreOpenings } from "@/features/weeks/server/manage-week-openings";

// Deshacer un cambio de semanas: vuelve a las fechas de apertura que había antes.
export const POST = handle(async (request) => {
  const input = await parseJson(request, restoreOpeningsSchema);
  return ok(await restoreOpenings(input));
});
