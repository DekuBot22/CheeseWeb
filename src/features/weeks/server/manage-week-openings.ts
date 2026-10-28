import "server-only";
import { bogotaDate } from "@/lib/bogota-time";
import { activeOnly } from "@/domain/void";
import { openingDateError, type WeekOpening } from "@/domain/week-opening";
import { planWeekRange } from "@/domain/week-range";
import { restorePlan } from "@/domain/week-restore";
import { MIGRATION_007_MESSAGE } from "@/server/db";
import { AppError, NotFoundError, ValidationError } from "@/server/errors";
import type { OpenWeekInput, RestoreOpeningsBody, WeekRangeBody } from "../schemas";
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

const UNDO_REASON = "Se deshizo un cambio de semanas";

// Deshace un cambio: deja vigentes exactamente las aperturas de `dates` (las de antes del cambio). Las que sobran se
// anulan con motivo y las que faltan se vuelven a abrir, con la nota que tenían. Nada se borra.
export async function restoreOpenings(input: RestoreOpeningsBody, now: Date = new Date()): Promise<{ voided: number; added: number }> {
  const { openings, ready } = await fetchWeekOpenings();
  if (!ready) throw new AppError(MIGRATION_007_MESSAGE, 503);
  if (input.dates.some((d) => d > bogotaDate(now))) throw new ValidationError("No se puede abrir una semana con fecha futura");

  const plan = restorePlan(
    activeOnly(openings).map((o) => ({ id: o.id, date: o.start_date })),
    input.dates
  );
  for (const id of plan.void) await voidWeekOpening(id, UNDO_REASON);
  if (plan.add.length > 0) {
    const noteOf = (date: string) =>
      openings.filter((o) => o.start_date === date).sort((a, b) => b.created_at.localeCompare(a.created_at))[0]?.note ?? null;
    await insertWeekOpenings(plan.add.map((date) => ({ start_date: date, note: noteOf(date) })));
  }
  return { voided: plan.void.length, added: plan.add.length };
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
