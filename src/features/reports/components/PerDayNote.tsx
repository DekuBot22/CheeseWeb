import type { WeekPoint } from "@/domain/accounting";
import { formatCOP, plural } from "@/lib/format";
import { Callout } from "@/ui/Callout";

const perDay = (value: number, days: number) => formatCOP(Math.round(value / Math.max(days, 1)));

// Cuando la semana en curso y la anterior no duran lo mismo, compara también por día
// (la comparación en pesos engaña: una semana de 9 días siempre parece mejor que una de 7).
export function PerDayNote({ cur, prev, elapsed }: { cur: WeekPoint; prev: WeekPoint; elapsed: number }) {
  if (cur.days === prev.days) return null;
  return (
    <Callout tone="info">
      La semana anterior duró {plural(prev.days, "día")} y esta lleva {plural(elapsed, "día")}. Por día: cobrado{" "}
      {perDay(cur.stats.collected, elapsed)} frente a {perDay(prev.stats.collected, prev.days)}; ganancia{" "}
      {perDay(cur.stats.profit, elapsed)} frente a {perDay(prev.stats.profit, prev.days)}.
    </Callout>
  );
}
