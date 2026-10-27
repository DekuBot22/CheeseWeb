import "server-only";
import { bogotaDate } from "@/lib/bogota-time";
import { activeOnly } from "@/domain/void";
import { openingDateError, type WeekOpening } from "@/domain/week-opening";
import { planWeekRange } from "@/domain/week-range";
import { MIGRATION_007_MESSAGE } from "@/server/db";
import { AppError, NotFoundError, ValidationError } from "@/server/errors";
import type { OpenWeekInput, WeekRangeBody } from "../schemas";
import { fetchWeekOpenings, insertWeekOpening, insertWeekOpenings, moveWeekOpening, voidWeekOpening } from "./week-openings.repo";

// Lectura fresca (sin cache) de las aperturas vigentes, para validar antes de escribir.
async function activeOpenings() {
  const { openings, ready } = await fetchWeekOpenings();
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

// Crea o edita una semana con "desde / hasta": el dominio decide los pasos (insertar / mover) y aquí se ejecutan en orden.
export async function saveWeekRange(input: WeekRangeBody, now: Date = new Date()): Promise<{ steps: number }> {
  const active = await activeOpenings();
  const refs = active.map((o) => ({ id: o.id, date: o.start_date }));
  const plan = planWeekRange(refs, { from: input.from, until: input.until, editingId: input.id }, bogotaDate(now));
  if (!plan.ok) throw new ValidationError(plan.error);

  let done = 0;
  try {
    for (const step of plan.steps) {
      if (step.kind === "move") await moveWeekOpening(step.id, step.date);
      else await insertWeekOpenings(step.dates.map((d) => ({ start_date: d, note: input.note })));
      done++;
    }
  } catch (err) {
    if (done === 0) throw err;
    console.error(err);
    throw new AppError("Se guardó solo una parte del cambio. Revisa la lista de semanas.");
  }
  return { steps: done };
}
