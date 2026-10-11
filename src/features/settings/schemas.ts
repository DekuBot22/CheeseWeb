import { z } from "zod";
import { isNonNegative, isPositive, numberField } from "@/lib/zod-helpers";

export const updateSettingsSchema = z.object({
  price_per_kg: numberField(isPositive, "Precio inválido"),
  // Si no viene el costo, se guarda 0.
  cost_per_kg: z
    .unknown()
    .transform((v) => (v === undefined ? 0 : Number(v)))
    .refine(isNonNegative, "Costo inválido"),
});
