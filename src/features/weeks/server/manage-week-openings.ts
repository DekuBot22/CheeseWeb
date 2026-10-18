import "server-only";
import { bogotaDate } from "@/lib/bogota-time";
import { activeOnly } from "@/domain/void";
import { openingDateError, type WeekOpening } from "@/domain/week-opening";
import { MIGRATION_007_MESSAGE } from "@/server/db";
import { AppError, NotFoundError, ValidationError } from "@/server/errors";
import type { OpenWeekInput } from "../schemas";
import { insertWeekOpening, listWeekOpenings, moveWeekOpening, voidWeekOpening } from "./week-openings.repo";

// Lectura fresca (sin cache) de las aperturas vigentes, para validar antes de escribir.
async function activeOpenings() {
  const { openings, ready } = await listWeekOpenings();
  if (!ready) throw new AppError(MIGRATION_007_MESSAGE, 503);
  return activeOnly(openings);
}

export async function openWeek(input: OpenWeekInput, now: Date = new Date()): Promise<WeekOpening> {
  const dates = (await activeOpenings()).map((o) => o.start_date);
  const error = openingDateError(dates, input.start_date, bogotaDate(now));
  if (error) throw new ValidationError(error);
  return insertWeekOpening({ start_date: input.start_date, note: input.note });
}

export async function moveOpening(id: string, newDate: string, now: Date = new Date()): Promise<WeekOpening> {
  const active = await activeOpenings();
  const target = active.find((o) => o.id === id);
  if (!target) throw new NotFoundError("Apertura no encontrada");
  const others = active.filter((o) => o.id !== id).map((o) => o.start_date);
  const error = openingDateError(others, newDate, bogotaDate(now), target.start_date);
  if (error) throw new ValidationError(error);
  return moveWeekOpening(id, newDate);
}

export async function voidOpening(id: string, reason: string): Promise<WeekOpening> {
  return voidWeekOpening(id, reason);
}
