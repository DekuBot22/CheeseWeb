// Borrador de la semana que se edita en el calendario: qué borde se mueve y cómo cada toque lo cambia.
//
// El borrador usa el mismo modelo que el formulario "desde / hasta" (`WeekRangeInput`), así que
// `planWeekRange` decide si es válido y qué pasos ejecutar: aquí no se duplica ninguna regla.

import { addDays } from "./week-calendar";
import type { OpeningRef, WeekRangeInput } from "./week-range";

export type Edge = "from" | "last";

export interface Draft {
  // Apertura que se edita; sin él se crea una semana nueva.
  id?: string;
  from: string;
  // Último día (incluido); null = sigue en curso.
  last: string | null;
  // Qué borde mueve el siguiente toque.
  edge: Edge;
}

// Primer toque. En una semana marcada se selecciona para editarla (mueve el inicio);
// en un día sin semana se crea una nueva que llega hasta el día antes de la siguiente apertura.
export function startDraft(openings: OpeningRef[], day: string, today: string): Draft | null {
  if (day > today) return null;
  const sorted = [...openings].sort((a, b) => a.date.localeCompare(b.date));
  const index = sorted.reduce((found, o, i) => (o.date <= day ? i : found), -1);
  if (index >= 0) {
    const next = sorted[index + 1];
    return { id: sorted[index].id, from: sorted[index].date, last: next ? addDays(next.date, -1) : null, edge: "from" };
  }
  const next = sorted[0];
  return { from: day, last: next ? addDays(next.date, -1) : null, edge: "last" };
}

// Con un borrador abierto cada toque mueve el borde elegido. Tocar hoy (o después) en el fin = sigue en curso.
export function tapDay(draft: Draft, day: string, today: string): Draft {
  if (day > today) return draft;
  if (draft.edge === "from") return { ...draft, from: day };
  return { ...draft, last: day >= today ? null : day };
}

export const setEdge = (draft: Draft, edge: Edge): Draft => ({ ...draft, edge });

// "Sigue en curso": se marca o se desmarca. Al desmarcar, el fin pasa a ser ayer (equivale a abrir hoy).
export function setOngoing(draft: Draft, ongoing: boolean, today: string): Draft {
  return { ...draft, last: ongoing ? null : addDays(today, -1) };
}

// El borrador como entrada de `planWeekRange`: el "hasta" es el día siguiente al último día.
export function draftInput(draft: Draft): WeekRangeInput {
  return { from: draft.from, until: draft.last ? addDays(draft.last, 1) : null, editingId: draft.id };
}
