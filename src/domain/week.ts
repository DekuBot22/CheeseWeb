// Semana de negocio: sábado 00:00:00 a viernes 23:59:59.999, siempre en hora
// de Colombia (America/Bogota, UTC-5 todo el año, sin horario de verano).
// El queso llega los sábados y la venta de esa semana se cierra cuando llega
// el siguiente lote. No es una semana de calendario (lunes a domingo) ni una
// ventana móvil de 7 días: es un rango fijo anclado al sábado más reciente.
//
// Se calcula con la hora de Bogotá y no con la del servidor: en Vercel el
// servidor corre en UTC y el corte de semana caería el viernes a las 7 p. m.

import { BOGOTA_OFFSET_MS, bogotaDate, toBogotaWall } from "@/lib/bogota-time";

const SATURDAY = 6;
const DAY_MS = 24 * 60 * 60 * 1000;

export function weekRange(anchor: Date = new Date()): { start: Date; end: Date } {
  const wall = toBogotaWall(anchor);
  const diffToSaturday = (wall.getUTCDay() - SATURDAY + 7) % 7;
  const startWall = Date.UTC(wall.getUTCFullYear(), wall.getUTCMonth(), wall.getUTCDate() - diffToSaturday);
  const start = new Date(startWall - BOGOTA_OFFSET_MS);
  const end = new Date(start.getTime() + 7 * DAY_MS - 1);
  return { start, end };
}

export function shiftWeek(startISO: string, deltaWeeks: number): Date {
  return new Date(new Date(startISO).getTime() + deltaWeeks * 7 * DAY_MS);
}

// Rango de fechas (AAAA-MM-DD, ambos incluidos) de una semana de negocio.
// El fin es el viernes: así una compra hecha el sábado siguiente no cuenta dos veces.
export function weekDateRange(start: Date, end: Date): { from: string; to: string } {
  return { from: bogotaDate(start), to: bogotaDate(end) };
}

// Lee el parámetro `?semana=AAAA-MM-DD` de la URL. Devuelve un instante dentro
// de ese día en hora de Bogotá, o null si el texto no es una fecha válida.
export function parseWeekParam(value: string | undefined): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T12:00:00-05:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}
