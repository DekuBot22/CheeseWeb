import { AppError } from "@/server/errors";
import { handle, ok, parseJson } from "@/server/http";
import { updateSettingsSchema } from "@/features/settings/schemas";
import { updateSettings } from "@/features/settings/server/settings.repo";

export const POST = handle(async (request) => {
  const { price_per_kg, cost_per_kg } = await parseJson(request, updateSettingsSchema);
  const settings = await updateSettings(price_per_kg, cost_per_kg);
  if (!settings) throw new AppError("No se pudo actualizar el precio");
  return ok({ settings });
});
