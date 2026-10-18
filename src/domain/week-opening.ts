import { formatDay } from "@/lib/format";
import type { Voidable } from "./void";

// Una apertura de semana: el día (hora de Bogotá) en que el dueño abrió una semana nueva.
export interface WeekOpening extends Voidable {
  id: string;
  start_date: string;
  note: string | null;
  created_at: string;
}

const before = (dates: string[], limit: string) => dates.filter((d) => d < limit).sort().pop();
const after = (dates: string[], limit: string) => dates.filter((d) => d > limit).sort()[0];

// Mensaje de error si `date` no es una fecha válida para abrir (o mover) una semana; null si sirve.
// `others` son las aperturas vigentes (sin la que se está moviendo); `moving` es la fecha vieja al mover.
export function openingDateError(others: string[], date: string, today: string, moving?: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T12:00:00Z`))) return "Fecha inválida";
  if (date > today) return "No se puede abrir una semana con fecha futura";
  if (others.includes(date)) return "Ya hay una semana abierta ese día";

  if (moving === undefined) {
    const last = others.slice().sort().pop();
    return last && date < last ? `Debe ser después de la última apertura (${formatDay(last)})` : null;
  }
  const lower = before(others, moving);
  const upper = after(others, moving);
  if ((lower && date <= lower) || (upper && date >= upper)) {
    const range = [lower && `después del ${formatDay(lower)}`, upper && `antes del ${formatDay(upper)}`];
    return `Debe quedar ${range.filter(Boolean).join(" y ")}`;
  }
  return null;
}
