// Cifras cortas de cada semana para la lista del selector: ganancia y lo que falta por cobrar.
// Salen del mismo `weeklySeries` que Ganancias, así que cuadran con esa pantalla.

import type { WeekPoint } from "./accounting";

export interface WeekFigure {
  // Primer día de la semana (AAAA-MM-DD): la misma clave que usa `?semana=`.
  from: string;
  profit: number;
  // Vendido en la semana − cobrado de esos pedidos (lo que sigue por cobrar de la semana).
  pending: number;
  orders: number;
}

export function weekFigures(weeks: { from: string }[], points: WeekPoint[]): WeekFigure[] {
  return points.map((p, i) => ({
    from: weeks[i].from,
    profit: p.stats.profit,
    pending: Math.max(p.stats.revenue - p.stats.collected, 0),
    orders: p.orderCount,
  }));
}
