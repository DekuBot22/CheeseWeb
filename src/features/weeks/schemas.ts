import { z } from "zod";
import { dateField, optionalText } from "@/lib/zod-helpers";

export const openWeekSchema = z.object({
  start_date: dateField("Fecha inválida"),
  note: optionalText(300),
});

export const moveWeekSchema = z.object({
  start_date: dateField("Fecha inválida"),
});

// Crear (sin id) o editar (con id) una semana indicando desde y hasta. `until` null = sigue en curso.
export const weekRangeSchema = z.object({
  from: dateField("Fecha inválida"),
  until: dateField("Fecha inválida").nullable(),
  id: z.string().regex(/^[0-9a-f-]{36}$/i, "Apertura inválida").optional(),
  note: optionalText(300),
});

// Deshacer: las fechas de apertura que había antes del cambio (puede ser ninguna).
export const restoreOpeningsSchema = z.object({
  dates: z.array(dateField("Fecha inválida")).max(200),
});

// Parámetros de la vista previa "qué cambia de semana" (GET).
export const effectQuerySchema = z.object({
  action: z.enum(["abrir", "mover", "anular", "rango"], { message: "Acción inválida" }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida").optional(),
  id: z.string().regex(/^[0-9a-f-]{36}$/i, "Apertura inválida").optional(),
  // Solo para "rango": inicio y fin (sin `until` = sigue en curso).
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida").optional(),
  until: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida").optional(),
});

export type WeekRangeBody = z.output<typeof weekRangeSchema>;
export type RestoreOpeningsBody = z.output<typeof restoreOpeningsSchema>;
export type OpenWeekInput = z.output<typeof openWeekSchema>;
export type EffectQuery = z.output<typeof effectQuerySchema>;
