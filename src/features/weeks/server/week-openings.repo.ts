import "server-only";
import { cache } from "react";
import { activeOnly } from "@/domain/void";
import type { WeekOpening } from "@/domain/week-opening";
import { db, fetchAll, isMissingFunctionError, isMissingTableError, MIGRATION_007_MESSAGE } from "@/server/db";
import { AppError, NotFoundError, ValidationError } from "@/server/errors";

// La tabla `week_openings` la crea la migración 007. Mientras no exista, las
// lecturas devuelven una lista vacía (el calendario sigue con sábado→viernes) y
// guardar responde 503 con un mensaje claro. Mismo patrón que `provider_discounts`.
async function orEmptyIfMissing<T>(read: () => Promise<T[]>): Promise<{ rows: T[]; ready: boolean }> {
  try {
    return { rows: await read(), ready: true };
  } catch (err) {
    if (isMissingTableError(err)) return { rows: [], ready: false };
    throw err;
  }
}

// Todas las aperturas (también las anuladas), de la más vieja a la más nueva, y si la tabla ya existe.
// Lectura fresca: la usan las escrituras para validar contra lo que hay de verdad.
export async function fetchWeekOpenings(): Promise<{ openings: WeekOpening[]; ready: boolean }> {
  const { rows, ready } = await orEmptyIfMissing(() =>
    fetchAll<WeekOpening>((from, to) =>
      db().from("week_openings").select("*").order("start_date", { ascending: true }).range(from, to)
    )
  );
  return { openings: rows, ready };
}

// Lo mismo, pero una sola vez por página (cache de React): para pintar pantallas.
export const listWeekOpenings = cache(fetchWeekOpenings);

// Fechas de las aperturas vigentes.
export async function listActiveOpeningDates(): Promise<string[]> {
  const { openings } = await listWeekOpenings();
  return activeOnly(openings).map((o) => o.start_date);
}

export async function insertWeekOpening(row: { start_date: string; note: string | null }): Promise<WeekOpening> {
  const { data, error } = await db().from("week_openings").insert(row).select().single();
  if (error && isMissingTableError(error)) throw new AppError(MIGRATION_007_MESSAGE, 503);
  if (error?.code === "23505") throw new ValidationError("Ya hay una semana abierta ese día");
  if (error || !data) {
    console.error(error);
    throw new AppError("No se pudo abrir la semana");
  }
  return data as WeekOpening;
}

// Inserta varias aperturas en una sola sentencia (todas o ninguna).
export async function insertWeekOpenings(rows: { start_date: string; note: string | null }[]): Promise<WeekOpening[]> {
  const { data, error } = await db().from("week_openings").insert(rows).select();
  if (error && isMissingTableError(error)) throw new AppError(MIGRATION_007_MESSAGE, 503);
  if (error?.code === "23505") throw new ValidationError("Ya hay una semana que empieza ese día");
  if (error || !data) {
    console.error(error);
    throw new AppError("No se pudo guardar la semana");
  }
  return data as WeekOpening[];
}

// Errores que lanza `move_week_opening` (`raise exception '...'`) → texto claro.
const MOVE_ERRORS: Record<string, () => AppError> = {
  apertura_no_encontrada: () => new NotFoundError("Apertura no encontrada"),
  apertura_ya_anulada: () => new ValidationError("Esta apertura ya estaba anulada"),
  fecha_futura: () => new ValidationError("No se puede abrir una semana con fecha futura"),
  misma_fecha: () => new ValidationError("Elige una fecha distinta"),
  fecha_fuera_de_orden: () => new ValidationError("La fecha debe quedar entre la apertura anterior y la siguiente"),
};

// Mueve una apertura (anula la vieja y crea la nueva) en una sola transacción.
export async function moveWeekOpening(id: string, newDate: string): Promise<WeekOpening> {
  const { data, error } = await db().rpc("move_week_opening", { p_id: id, p_new_date: newDate });
  if (error) {
    if (isMissingFunctionError(error) || isMissingTableError(error)) throw new AppError(MIGRATION_007_MESSAGE, 503);
    if (error.code === "23505") throw new ValidationError("Ya hay una semana abierta ese día");
    const known = MOVE_ERRORS[error.message];
    if (known) throw known();
    console.error(error);
    throw new AppError("No se pudo mover la apertura");
  }
  return data as WeekOpening;
}

// Anula una apertura (nunca se borra). Responde 404 si no existe o ya estaba anulada.
export async function voidWeekOpening(id: string, reason: string): Promise<WeekOpening> {
  const { data, error } = await db()
    .from("week_openings")
    .update({ voided_at: new Date().toISOString(), void_reason: reason.trim() })
    .eq("id", id)
    .is("voided_at", null)
    .select()
    .maybeSingle();
  if (error && isMissingTableError(error)) throw new AppError(MIGRATION_007_MESSAGE, 503);
  if (error) {
    console.error(error);
    throw new AppError("No se pudo anular la apertura");
  }
  if (!data) throw new NotFoundError("No existe o ya estaba anulada");
  return data as WeekOpening;
}
