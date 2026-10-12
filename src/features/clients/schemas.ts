import { z } from "zod";

// Texto recortado; vacío → null; si no es texto → undefined (no se toca ese campo).
// `.optional()` antes de `transform`: sin él zod 4 rechaza la clave cuando FALTA en el JSON.
const editableText = z
  .unknown()
  .optional()
  .transform((v) => (typeof v === "string" ? v.trim() || null : undefined));

export const updateClientSchema = z.object({
  phone: editableText,
  notes: editableText,
});
