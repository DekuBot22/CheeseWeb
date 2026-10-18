import "server-only";
import { buildCalendar, type WeekCalendar } from "@/domain/week-calendar";

// Calendario de semanas de negocio para la página que se está armando.
// (Las aperturas marcadas por el dueño se leerán de la base en el paso siguiente.)
export async function getWeekCalendar(now: Date = new Date()): Promise<WeekCalendar> {
  return buildCalendar([], now);
}
