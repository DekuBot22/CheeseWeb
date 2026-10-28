// Ventas por día para el calendario de Ajustes: ayuda a ver dónde hubo movimiento al marcar una semana.

import { bogotaDate } from "@/lib/bogota-time";
import type { DayCell, MonthGrid } from "./week-month";

// AAAA-MM-DD (hora de Bogotá) → cuántos pedidos se hicieron ese día.
export type SalesByDay = Record<string, number>;

export function salesByDay(createdAt: readonly string[]): SalesByDay {
  const counts: SalesByDay = {};
  for (const iso of createdAt) {
    const day = bogotaDate(new Date(iso));
    counts[day] = (counts[day] ?? 0) + 1;
  }
  return counts;
}

// La misma cuadrícula, con las ventas de cada día anotadas en su celda (sin tocar la original).
export function withSales(grid: MonthGrid, sales: SalesByDay): MonthGrid {
  const mark = (cell: DayCell): DayCell => (sales[cell.date] ? { ...cell, sales: sales[cell.date] } : cell);
  return { ...grid, rows: grid.rows.map((row) => row.map(mark)) };
}
