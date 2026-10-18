import { buildCalendar, dayStart, daysBetween, weekOf, type Week } from "./week-calendar";

// Días que lleva la semana hasta hoy (1 el primer día).
export function weekElapsed(week: Week, today: string): number {
  return Math.max(daysBetween(week.from, today < week.to ? today : week.to), 1);
}

// Cuándo recordarle al dueño que abra la semana nueva:
// - "compra": hoy registró la primera compra de la semana y la semana no empezó hoy
//   (el lote llegó hoy y la semana sigue siendo la de antes);
// - "largo": una semana abierta a mano lleva 6 días o más (se le pudo olvidar).
// En semanas automáticas (sábado a viernes) solo avisa la compra, para no insistir cada semana.
export type OpenWeekHint = "compra" | "largo" | null;

export function openWeekHint(week: Week, today: string, purchaseDatesInWeek: string[]): OpenWeekHint {
  const boughtToday = purchaseDatesInWeek.includes(today);
  const boughtBefore = purchaseDatesInWeek.some((d) => d < today);
  if (boughtToday && !boughtBefore && week.from !== today) return "compra";
  if (week.manual && weekElapsed(week, today) >= 6) return "largo";
  return null;
}

// Al marcar la PRIMERA apertura a mano, la semana automática anterior (sábado a viernes)
// se corta ese día. Devuelve cuántos días le quedan si queda más corta que 7; null si
// queda completa (por ejemplo, si la apertura cae en sábado).
export function shortenedPreviousWeek(date: string, today: string): number | null {
  const now = new Date(`${today}T12:00:00-05:00`);
  const cal = buildCalendar([date], now);
  const previous = weekOf(cal, new Date(dayStart(date).getTime() - 1));
  return previous.days < 7 ? previous.days : null;
}
