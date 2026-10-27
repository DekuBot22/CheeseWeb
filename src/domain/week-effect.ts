// Qué cambia de semana cuando se abre, se mueve o se anula una apertura.
//
// Se compara el calendario de antes con el de después: los días cuya semana cambia
// son el rango afectado, y todo lo que se registró en esos días (pedidos, compras,
// pagos y descuentos del proveedor) pasa de una semana a otra.

import { addDays, buildCalendar, dayStart, nextWeek, weekOf, type Week } from "./week-calendar";

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

// ---- Cambios generales (crear o editar semanas en cualquier punto de la historia) ----

export type ChangeSegment = OpeningEffect;

// Compara el calendario de antes y de después día por día, desde la primera fecha que cambia
// hasta hoy, y junta los días seguidos que pasan de la misma semana a la misma semana.
export function calendarChanges(before: string[], after: string[], today: string): ChangeSegment[] {
  const changed = [...before.filter((d) => !after.includes(d)), ...after.filter((d) => !before.includes(d))].sort();
  if (changed.length === 0 || changed[0] > today) return [];

  const now = new Date(`${today}T12:00:00-05:00`);
  const calBefore = buildCalendar(before, now);
  const calAfter = buildCalendar(after, now);
  const segments: ChangeSegment[] = [];

  for (let day = changed[0]; day <= today; day = addDays(day, 1)) {
    const instant = dayStart(day);
    const fromWeek = weekOf(calBefore, instant).from;
    const toWeek = weekOf(calAfter, instant).from;
    if (fromWeek === toWeek) continue;
    const last = segments[segments.length - 1];
    if (last && last.fromWeek === fromWeek && last.toWeek === toWeek && addDays(last.to, 1) === day) last.to = day;
    else segments.push({ from: day, to: day, fromWeek, toWeek });
  }
  return segments;
}

// Semanas del calendario nuevo que tocan los cambios (para mostrar "Así quedan"), de la más vieja a la más nueva.
export function affectedWeeks(after: string[], segments: ChangeSegment[], today: string): Week[] {
  if (segments.length === 0) return [];
  const cal = buildCalendar(after, new Date(`${today}T12:00:00-05:00`));
  const first = segments.reduce((min, s) => (s.from < min ? s.from : min), segments[0].from);
  const last = segments.reduce((max, s) => (s.to > max ? s.to : max), segments[0].to);

  const weeks: Week[] = [];
  let week: Week | null = weekOf(cal, dayStart(addDays(first, -1)));
  while (week && weeks.length < 60) {
    weeks.push(week);
    if (week.to > last) break;
    week = nextWeek(cal, week);
  }
  return weeks;
}
