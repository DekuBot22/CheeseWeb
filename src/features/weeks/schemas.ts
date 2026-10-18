import { z } from "zod";
import { dateField, optionalText } from "@/lib/zod-helpers";

export const openWeekSchema = z.object({
  start_date: dateField("Fecha inválida"),
  note: optionalText(300),
});

export const moveWeekSchema = z.object({
  start_date: dateField("Fecha inválida"),
});

// Parámetros de la vista previa "qué cambia de semana" (GET).
export const effectQuerySchema = z.object({
  action: z.enum(["abrir", "mover", "anular"], { message: "Acción inválida" }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida").optional(),
  id: z.string().regex(/^[0-9a-f-]{36}$/i, "Apertura inválida").optional(),
});

export type OpenWeekInput = z.output<typeof openWeekSchema>;
export type EffectQuery = z.output<typeof effectQuerySchema>;
