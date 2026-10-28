// Calendario de semanas de negocio con aperturas marcadas por el dueño.
//
// Cada semana empieza el día (hora de Bogotá) en que el dueño la abre y termina
// el día antes de la siguiente apertura. Antes de la primera apertura vigente
// rige la regla de siempre (sábado a viernes, `week.ts`): por eso, sin
// aperturas, el calendario da exactamente las mismas semanas de antes.
//
// Desde la primera apertura solo cuentan las marcadas (no hay sábados
// automáticos): si se olvida abrir una, la semana en curso simplemente crece.
// Todo se calcula por DÍA, así una compra del día de apertura cuenta una sola vez.

import { bogotaDate } from "@/lib/bogota-time";
import { weekRange } from "./week";

const DAY_MS = 24 * 60 * 60 * 1000;

export interface Week {
  start: Date;
  end: Date;
  // Primer y último día (AAAA-MM-DD, ambos incluidos) para comparar con columnas `date`.
  from: string;
  to: string;
  // Días que abarca (la semana en curso cuenta hasta hoy, con mínimo 7).
  days: number;
  // true si empieza en una apertura marcada; false si es la regla sábado→viernes.
  manual: boolean;
}

export interface WeekCalendar {
  // Fechas AAAA-MM-DD de aperturas vigentes ya llegadas (no futuras), de la más vieja a la más nueva.
  openings: string[];
  today: string;
}

// Inicio del día (00:00 en Bogotá) de una fecha AAAA-MM-DD.
export function dayStart(date: string): Date {
  return new Date(`${date}T00:00:00.000-05:00`);
}

// Último instante del día de una fecha AAAA-MM-DD.
const dayEnd = (date: string) => new Date(dayStart(date).getTime() + DAY_MS - 1);

// Días entre dos fechas AAAA-MM-DD (ambas incluidas).
export function daysBetween(from: string, to: string): number {
  return Math.round((dayStart(to).getTime() - dayStart(from).getTime()) / DAY_MS) + 1;
}

export function addDays(date: string, delta: number): string {
  return bogotaDate(new Date(dayStart(date).getTime() + delta * DAY_MS + 12 * 60 * 60 * 1000));
}

function makeWeek(start: Date, end: Date, manual: boolean): Week {
  const from = bogotaDate(start);
  const to = bogotaDate(end);
  return { start, end, from, to, days: daysBetween(from, to), manual };
}

// Arma el calendario con las fechas de apertura vigentes. Ignora duplicadas,
// anuladas (no deben llegar aquí) y futuras.
export function buildCalendar(openingDates: string[], now: Date = new Date()): WeekCalendar {
  const today = bogotaDate(now);
  const openings = [...new Set(openingDates)].filter((d) => d <= today).sort();
  return { openings, today };
}

// La semana que contiene ese instante.
export function weekOf(cal: WeekCalendar, instant: Date): Week {
  const date = bogotaDate(instant);
  const { openings } = cal;

  if (openings.length > 0 && date >= openings[0]) {
    let i = openings.length - 1;
    while (openings[i] > date) i--;
    const start = dayStart(openings[i]);
    const next = openings[i + 1];
    if (next) return makeWeek(start, new Date(dayStart(next).getTime() - 1), true);
    // Semana en curso: dura al menos 7 días y se alarga con los días que pasen.
    const natural = start.getTime() + 7 * DAY_MS - 1;
    return makeWeek(start, new Date(Math.max(natural, dayEnd(cal.today).getTime())), true);
  }

  // Antes de la primera apertura: sábado a viernes, recortada si la primera apertura cae a mitad de semana.
  const base = weekRange(instant);
  const limit = openings.length > 0 ? dayStart(openings[0]).getTime() - 1 : Infinity;
  return makeWeek(base.start, new Date(Math.min(base.end.getTime(), limit)), false);
}

export function currentWeek(cal: WeekCalendar): Week {
  return weekOf(cal, dayStart(cal.today));
}

// Semana anterior a la dada (siempre existe: la regla de sábado llega hasta el pasado).
export function previousWeek(cal: WeekCalendar, week: Week): Week {
  return weekOf(cal, new Date(week.start.getTime() - 1));
}

// Semana siguiente, o null si la dada ya es la de hoy.
export function nextWeek(cal: WeekCalendar, week: Week): Week | null {
  if (week.to >= cal.today) return null;
  return weekOf(cal, new Date(week.end.getTime() + 1));
}

// Las `count` semanas que terminan en `anchor`, la más antigua primero.
export function lastWeeks(cal: WeekCalendar, count: number, anchor: Week): Week[] {
  const weeks: Week[] = [anchor];
  while (weeks.length < count) weeks.unshift(previousWeek(cal, weeks[0]));
  return weeks;
}

// Las semanas que el dueño marcó: desde su primera apertura hasta `anchor` (tope `max`, las más recientes).
// Sin aperturas solo queda la semana actual: las automáticas de antes no se muestran.
export function markedWeeks(cal: WeekCalendar, anchor: Week, max: number): Week[] {
  if (cal.openings.length === 0) return [anchor];
  return weeksSince(cal, dayStart(cal.openings[0]), anchor, max);
}

// Quita del principio las semanas automáticas sin nada (nunca una marcada a mano) y deja al menos `keep`.
// Solo recorta filas vacías: las sumas de lo que queda son idénticas a las de la lista completa.
export function dropEmptyLead<T extends { manual: boolean }>(items: T[], isEmpty: (item: T) => boolean, keep = 1): T[] {
  let skip = 0;
  while (skip < items.length - keep && !items[skip].manual && isEmpty(items[skip])) skip++;
  return items.slice(skip);
}

// Semanas desde la que contiene `first` hasta `anchor` (tope `max`, las más recientes).
export function weeksSince(cal: WeekCalendar, first: Date, anchor: Week, max: number): Week[] {
  const weeks: Week[] = [anchor];
  while (weeks.length < max && weeks[0].start.getTime() > first.getTime()) {
    weeks.unshift(previousWeek(cal, weeks[0]));
  }
  return weeks;
}
