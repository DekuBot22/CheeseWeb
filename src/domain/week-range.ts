// Crear o editar una semana indicando "desde" y "hasta".
//
// Solo se guarda la fecha de inicio de cada semana (`week_openings`): el "hasta" es el día
// en que llega el queso siguiente, y ese día ya cuenta para la semana nueva. Así nunca hay
// huecos ni traslapes. Poner fin a una semana = insertar o mover la apertura siguiente.
//
// Todo aquí es puro: devuelve los pasos a ejecutar (insertar / mover) o el error en español.

import { formatDay } from "@/lib/format";

export interface OpeningRef {
  id: string;
  date: string; // AAAA-MM-DD
}

export interface WeekRangeInput {
  from: string;
  // Día en que llegó el queso siguiente (la semana termina el día anterior); null = sigue en curso.
  until: string | null;
  // Apertura que se edita; sin él se crea una semana nueva.
  editingId?: string;
}

export type WeekRangeStep = { kind: "insert"; dates: string[] } | { kind: "move"; id: string; date: string };

export type WeekRangePlan =
  | { ok: true; steps: WeekRangeStep[]; after: string[] }
  | { ok: false; error: string; field: "from" | "until" };

const fail = (field: "from" | "until", error: string): WeekRangePlan => ({ ok: false, field, error });
const isDate = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(`${d}T12:00:00Z`));
const sorted = (dates: string[]) => [...dates].sort();
const lastBefore = (dates: string[], limit: string) => sorted(dates.filter((d) => d < limit)).pop();
const firstAfter = (dates: string[], limit: string) => sorted(dates.filter((d) => d > limit))[0];

// Inicio de la semana siguiente (el "hasta" de la semana que empieza en `start`), o null si es la en curso.
export function weekUntil(openings: string[], start: string): string | null {
  return firstAfter(openings, start) ?? null;
}

export function planWeekRange(openings: OpeningRef[], input: WeekRangeInput, today: string): WeekRangePlan {
  const { from, until } = input;
  if (!isDate(from)) return fail("from", "Fecha inválida");
  if (from > today) return fail("from", "La semana no puede empezar en el futuro");
  if (until !== null) {
    if (!isDate(until)) return fail("until", "Fecha inválida");
    if (until > today) return fail("until", 'El fin no puede ser futuro. Si la semana sigue, marca "Sigue en curso"');
    if (until <= from) return fail("until", "El fin debe ser después del inicio");
  }
  return input.editingId ? planEdit(openings, input, today) : planCreate(openings, input);
}

function planCreate(openings: OpeningRef[], { from, until }: WeekRangeInput): WeekRangePlan {
  const dates = openings.map((o) => o.date);

  if (until === null) {
    const later = firstAfter(dates, from);
    if (later) {
      return fail("until", `Después del ${formatDay(from)} ya hay otra semana (empieza el ${formatDay(later)}). Indica hasta cuándo fue.`);
    }
  } else {
    const inside = sorted(dates.filter((d) => d > from && d < until))[0];
    if (inside) {
      return fail("until", `Entre el ${formatDay(from)} y el ${formatDay(until)} ya empieza otra semana (el ${formatDay(inside)}). Edítala o anúlala primero.`);
    }
  }

  const toInsert = [from, ...(until === null ? [] : [until])].filter((d) => !dates.includes(d));
  if (toInsert.length === 0) return fail("from", "Esa semana ya está así");
  return { ok: true, steps: [{ kind: "insert", dates: toInsert }], after: sorted([...dates, ...toInsert]) };
}

function planEdit(openings: OpeningRef[], { from, until, editingId }: WeekRangeInput, today: string): WeekRangePlan {
  const self = openings.find((o) => o.id === editingId);
  if (!self) return fail("from", "Esa semana ya no existe. Recarga la lista.");

  const others = openings.filter((o) => o.id !== self.id);
  const otherDates = others.map((o) => o.date);
  const prev = lastBefore(otherDates, self.date);
  if (otherDates.includes(from)) return fail("from", "Ya hay una semana que empieza ese día");
  if (prev && from <= prev) {
    return fail("from", `El inicio debe quedar después del ${formatDay(prev)}, cuando empieza la semana anterior. Para juntar semanas, anula una.`);
  }

  const next = firstAfter(otherDates, self.date);
  const nextRef = others.find((o) => o.date === next);
  const plan = nextRef
    ? planEditWithNext(self, nextRef, others, { from, until })
    : planEditCurrent(self, otherDates, { from, until }, today);
  if (!plan.ok) return plan;
  if (plan.steps.length === 0) return fail("from", "Esa semana ya está así");
  return plan;
}

// La semana tiene otra después: su "hasta" es la fecha de esa otra, así que se mueve (o se deja igual).
function planEditWithNext(self: OpeningRef, next: OpeningRef, others: OpeningRef[], { from, until }: Pick<WeekRangeInput, "from" | "until">): WeekRangePlan {
  if (until === null) return fail("until", `Para que siga en curso, anula la semana del ${formatDay(next.date)}.`);
  const afterNext = firstAfter(others.map((o) => o.date), next.date);
  if (afterNext && until >= afterNext) {
    return fail("until", `El fin debe quedar antes del ${formatDay(afterNext)}, cuando empieza la otra semana.`);
  }

  const steps: WeekRangeStep[] = [];
  const moveNext = until !== next.date;
  // Si el fin se corre más tarde, primero se mueve la siguiente para que el inicio nunca la pase.
  if (moveNext && until > next.date) steps.push({ kind: "move", id: next.id, date: until });
  if (from !== self.date) steps.push({ kind: "move", id: self.id, date: from });
  if (moveNext && until < next.date) steps.push({ kind: "move", id: next.id, date: until });
  const after = [...others.filter((o) => o.id !== next.id).map((o) => o.date), from, until];
  return { ok: true, steps, after: sorted(after) };
}

// Es la semana en curso: si se le pone fin, ese fin es una apertura nueva.
function planEditCurrent(self: OpeningRef, otherDates: string[], { from, until }: Pick<WeekRangeInput, "from" | "until">, today: string): WeekRangePlan {
  const steps: WeekRangeStep[] = [];
  const after = [...otherDates, from];
  if (from !== self.date) steps.push({ kind: "move", id: self.id, date: from });
  if (until !== null) {
    if (until > today) return fail("until", "El fin no puede ser futuro");
    steps.push({ kind: "insert", dates: [until] });
    after.push(until);
  }
  return { ok: true, steps, after: sorted(after) };
}
