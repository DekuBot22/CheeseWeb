// Qué cambia de semana cuando se abre, se mueve o se anula una apertura.
//
// Se compara el calendario de antes con el de después: los días cuya semana cambia
// son el rango afectado, y todo lo que se registró en esos días (pedidos, compras,
// pagos y descuentos del proveedor) pasa de una semana a otra.

import { addDays, buildCalendar, dayStart, weekOf } from "./week-calendar";

export interface OpeningEffect {
  // Primer y último día (AAAA-MM-DD, ambos incluidos) cuyos movimientos cambian de semana.
  from: string;
  to: string;
  // Primer día de la semana a la que pertenecían y a la que pasan.
  fromWeek: string;
  toWeek: string;
}

function effectOf(before: string[], after: string[], range: { from: string; to: string }, today: string): OpeningEffect | null {
  if (range.from > range.to) return null;
  const now = new Date(`${today}T12:00:00-05:00`);
  const day = dayStart(range.from);
  const fromWeek = weekOf(buildCalendar(before, now), day).from;
  const toWeek = weekOf(buildCalendar(after, now), day).from;
  return fromWeek === toWeek ? null : { ...range, fromWeek, toWeek };
}

const nextAfter = (dates: string[], date: string) => dates.filter((d) => d > date).sort()[0];

// Abrir una semana el día `date`: lo de ese día en adelante pasa a la semana nueva.
export function openWeekEffect(openings: string[], date: string, today: string): OpeningEffect | null {
  return effectOf(openings, [...openings, date], { from: date, to: today }, today);
}

// Mover la apertura `current` a `next`: solo cambian los días entre las dos fechas.
export function moveOpeningEffect(openings: string[], current: string, next: string, today: string): OpeningEffect | null {
  const after = openings.filter((d) => d !== current).concat(next);
  const range = next < current ? { from: next, to: addDays(current, -1) } : { from: current, to: addDays(next, -1) };
  return effectOf(openings, after, range, today);
}

// Anular la apertura `current`: toda su semana se junta con la anterior.
export function voidOpeningEffect(openings: string[], current: string, today: string): OpeningEffect | null {
  const following = nextAfter(openings, current);
  const range = { from: current, to: following ? addDays(following, -1) : today };
  return effectOf(openings, openings.filter((d) => d !== current), range, today);
}
