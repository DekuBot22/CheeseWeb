import "server-only";
import { buildCalendar, type WeekCalendar } from "@/domain/week-calendar";
import { listActiveOpeningDates } from "./week-openings.repo";

// Calendario de semanas de negocio con las aperturas marcadas por el dueño.
// Sin la migración 007 (o sin aperturas) da la regla de siempre: sábado a viernes.
export async function getWeekCalendar(now: Date = new Date()): Promise<WeekCalendar> {
  return buildCalendar(await listActiveOpeningDates(), now);
}
