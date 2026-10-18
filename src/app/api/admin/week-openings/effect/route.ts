import { handle, ok } from "@/server/http";
import { ValidationError } from "@/server/errors";
import { effectQuerySchema } from "@/features/weeks/schemas";
import { getOpeningEffect } from "@/features/weeks/server/get-opening-effect";

// Vista previa de lo que cambia de semana al abrir, mover o anular una apertura (solo lectura).
export const GET = handle(async (request) => {
  const parsed = effectQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message ?? "Datos inválidos");
  return ok(await getOpeningEffect(parsed.data));
});
