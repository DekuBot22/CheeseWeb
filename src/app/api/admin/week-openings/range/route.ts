import { created, handle, parseJson } from "@/server/http";
import { weekRangeSchema } from "@/features/weeks/schemas";
import { saveWeekRange } from "@/features/weeks/server/manage-week-openings";

// Crear (sin id) o editar (con id) una semana con "desde / hasta".
export const POST = handle(async (request) => {
  const input = await parseJson(request, weekRangeSchema);
  return created(await saveWeekRange(input));
});
