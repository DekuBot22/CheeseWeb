"use client";

import { GRID_FIRST_DAY, type MonthGrid } from "@/domain/week-month";
import { CalendarDay } from "./CalendarDay";
import { dayLabel } from "./day-label";
import type { useGridFocus } from "./use-grid-focus";

const INITIALS = ["D", "L", "M", "M", "J", "V", "S"];
const NAMES = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
// Columnas en el orden de la cuadrícula (empieza en GRID_FIRST_DAY).
const COLUMNS = Array.from({ length: 7 }, (_, i) => (GRID_FIRST_DAY + i) % 7);

// Cuadrícula del mes como tabla accesible (patrón de cuadrícula de fechas: un solo día en el orden de tabulación).
export function CalendarGrid({
  grid,
  gridId,
  labelId,
  focus,
  readOnly,
  onPick,
}: {
  grid: MonthGrid;
  gridId: string;
  labelId: string;
  focus: ReturnType<typeof useGridFocus>;
  readOnly: boolean;
  onPick: (date: string) => void;
}) {
  return (
    <table
      id={gridId}
      role="grid"
      aria-labelledby={labelId}
      onKeyDown={focus.onKeyDown}
      onFocus={focus.onFocus}
      className="w-full table-fixed border-separate border-spacing-y-0.5"
    >
      <thead>
        <tr>
          {COLUMNS.map((d) => (
            <th key={d} scope="col" abbr={NAMES[d]} className="pb-1 text-center text-[0.6875rem]/4 font-medium text-tinta-3">
              {INITIALS[d]}
            </th>
          ))}
        </tr>
      </thead>
      {/* Con key por mes el cuerpo se vuelve a montar y entra con un fundido corto. */}
      <tbody key={grid.month} className="aparece">
        {grid.rows.map((row) => (
          <tr key={row[0].date}>
            {row.map((cell, i) => (
              <CalendarDay
                key={cell.date}
                cell={cell}
                label={dayLabel(cell, grid.weeks)}
                tabbable={cell.date === focus.tabDate}
                disabled={readOnly}
                rowFirst={i === 0}
                rowLast={i === 6}
                onPick={onPick}
              />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
