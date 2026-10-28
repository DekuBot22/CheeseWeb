// Semana elegida para mirar todo el panel (`?semana=AAAA-MM-DD` en la URL).
//
// Sin parámetro, o con uno inválido, futuro o de la semana actual, se muestra la
// semana actual y la URL queda limpia. Las pantallas filtran sus datos con estas
// funciones puras: así Inicio, Pedidos, Clientes y Ganancias cuadran entre sí.

import { parseWeekParam } from "./week";
import { currentWeek, weekOf, type Week, type WeekCalendar } from "./week-calendar";

export const MAX_LISTED_WEEKS = 60;

export interface WeekScope {
  week: Week;
  isCurrent: boolean;
  // Valor para la URL (primer día de la semana); null cuando es la semana actual.
  param: string | null;
}

// Semana a mirar según el parámetro de la URL (nunca una futura).
export function resolveWeek(cal: WeekCalendar, value: string | undefined): WeekScope {
  const current = currentWeek(cal);
  const parsed = parseWeekParam(value);
  if (!parsed || (value as string) > cal.today) return { week: current, isCurrent: true, param: null };

  const week = weekOf(cal, parsed);
  const isCurrent = week.start.getTime() === current.start.getTime();
  return { week, isCurrent, param: isCurrent ? null : week.from };
}

// ¿Este instante (created_at) cae dentro de la semana?
export function inWeek(week: Pick<Week, "start" | "end">, iso: string): boolean {
  const t = new Date(iso).getTime();
  return t >= week.start.getTime() && t <= week.end.getTime();
}

// ¿Esta fecha AAAA-MM-DD (columnas `date`) cae dentro de la semana?
export function inWeekDate(week: Pick<Week, "from" | "to">, date: string): boolean {
  return date >= week.from && date <= week.to;
}

// Pedidos de la semana; sin semana (null) devuelve todos, como siempre.
export function scopeOrders<T extends { created_at: string }>(orders: readonly T[], week: Week | null): T[] {
  return week ? orders.filter((o) => inWeek(week, o.created_at)) : [...orders];
}
