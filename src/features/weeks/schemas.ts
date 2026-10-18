import { z } from "zod";
import { dateField, optionalText } from "@/lib/zod-helpers";

export const openWeekSchema = z.object({
  start_date: dateField("Fecha inválida"),
  note: optionalText(300),
});

export const moveWeekSchema = z.object({
  start_date: dateField("Fecha inválida"),
});

export type OpenWeekInput = z.output<typeof openWeekSchema>;
