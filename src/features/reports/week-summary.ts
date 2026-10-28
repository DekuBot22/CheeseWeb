import type { WeekPoint } from "@/domain/accounting";
import { profitPerLb } from "@/domain/pricing";
import type { Week } from "@/domain/week-calendar";
import { formatCOP, formatDay, plural } from "@/lib/format";

const perDay = (value: number, days: number) => formatCOP(Math.round(value / Math.max(days, 1)));

// Cuánto subió o bajó la ganancia frente a la semana anterior. null si esa semana no tuvo
// movimiento (no hay contra qué comparar).
export function profitDifference(cur: WeekPoint, prev: WeekPoint): number | null {
  if (prev.stats.revenue === 0 && prev.stats.profit === 0) return null;
  return cur.stats.profit - prev.stats.profit;
}

// Notas pequeñas al pie de "Esta semana": desde cuándo corre, ganancia por día, margen y,
// si la semana anterior duró distinto, la comparación por día (en pesos engañaría: una
// semana de 9 días siempre parece mejor que una de 7).
export function weekSummaryNotes(
  current: Week,
  cur: WeekPoint,
  prev: WeekPoint,
  { elapsed, past = false }: { elapsed: number; past?: boolean }
): string[] {
  const stats = cur.stats;
  const perLb = profitPerLb(stats.profit, stats.kgPaid);
  const since = `${current.manual ? "Semana abierta a mano el" : "Semana desde el"} ${formatDay(current.from)}`;

  const notes = [
    `${since} · ${perDay(stats.profit, elapsed)} de ganancia por día`,
    `Margen ${stats.margin.toFixed(0)} %${perLb === null ? "" : ` · ${formatCOP(Math.round(perLb))} por libra`} · cuenta solo lo que ya te pagaron`,
  ];

  if (cur.days !== prev.days) {
    notes.push(
      `La semana anterior duró ${plural(prev.days, "día")} y esta ${past ? "duró" : "lleva"} ${plural(elapsed, "día")}. Por día: cobrado ${perDay(stats.collected, elapsed)} frente a ${perDay(prev.stats.collected, prev.days)}; ganancia ${perDay(stats.profit, elapsed)} frente a ${perDay(prev.stats.profit, prev.days)}.`
    );
  }
  return notes;
}
