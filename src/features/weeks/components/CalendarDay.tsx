import type { Band, DayCell } from "@/domain/week-month";
import { cx } from "@/lib/cx";

// Clases literales (Tailwind solo ve nombres completos): tinte de fondo y raya inferior por color de banda.
export const BAND_CLASS: Record<Band, string> = {
  0: "bg-cat-1/15 border-b-cat-1",
  1: "bg-cat-2/15 border-b-cat-2",
  2: "bg-cat-3/15 border-b-cat-3",
  3: "bg-cat-4/15 border-b-cat-4",
};

export const SWATCH_CLASS: Record<Band, string> = { 0: "bg-cat-1", 1: "bg-cat-2", 2: "bg-cat-3", 3: "bg-cat-4" };

// Esquinas redondeadas al inicio y al final de cada banda (y en los bordes de la fila si la semana sigue).
function shape(cell: DayCell, rowFirst: boolean, rowLast: boolean): string {
  if (cell.band === null) return "rounded-md";
  return cx((rowFirst || cell.isStart) && "rounded-l-md", (rowLast || cell.isEnd) && "rounded-r-md");
}

function look(cell: DayCell): string {
  return cx(
    cell.band === null ? "border-transparent" : BAND_CLASS[cell.band],
    cell.inMonth ? "text-tinta" : "text-tinta-3",
    cell.isToday && "font-semibold ring-1 ring-inset ring-acento",
    cell.isFuture && "opacity-50",
    cell.inDraft && "outline-1 -outline-offset-2 outline-acento outline-dashed"
  );
}

// Un día de la cuadrícula: botón de al menos 44 px con la banda de su semana y un punto si llegó el queso.
export function CalendarDay({
  cell,
  label,
  tabbable,
  disabled,
  rowFirst,
  rowLast,
  onPick,
}: {
  cell: DayCell;
  label: string;
  tabbable: boolean;
  disabled: boolean;
  rowFirst: boolean;
  rowLast: boolean;
  onPick: (date: string) => void;
}) {
  return (
    <td role="gridcell" aria-selected={cell.inDraft} className="p-0">
      <button
        type="button"
        data-date={cell.date}
        tabIndex={tabbable ? 0 : -1}
        disabled={cell.isFuture || disabled}
        aria-label={label}
        onClick={() => onPick(cell.date)}
        className={cx(
          "presionable num relative flex h-11 w-full items-center justify-center border-b-[3px] text-sm transition-colors duration-[var(--dur-rapida)] md:h-10",
          shape(cell, rowFirst, rowLast),
          look(cell)
        )}
      >
        {cell.day}
        {cell.isStart && <span aria-hidden="true" className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-acento" />}
      </button>
    </td>
  );
}
