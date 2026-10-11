import { z } from "zod";

// Texto recortado; vacío → null; si no es texto → undefined (no se toca ese campo).
const editableText = z
  .unknown()
  .transform((v) => (typeof v === "string" ? v.trim() || null : undefined));

export const updateClientSchema = z.object({
  phone: editableText,
  notes: editableText,
});
