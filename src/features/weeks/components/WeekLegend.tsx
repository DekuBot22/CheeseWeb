import type { MonthWeek } from "@/domain/week-month";
import { formatDayShort, plural } from "@/lib/format";
import { cx } from "@/lib/cx";
import { SWATCH_CLASS } from "./CalendarDay";

// Chips con las semanas que tocan el mes: el color más el texto (no se depende solo del color) y
// un atajo para seleccionar la semana sin buscar su día en la cuadrícula.
export function WeekLegend({
  weeks,
  selectedFrom,
  readOnly,
  onPick,
}: {
  weeks: MonthWeek[];
  selectedFrom: string | null;
  readOnly: boolean;
  onPick: (from: string) => void;
}) {
  if (weeks.length === 0) return <p className="text-[0.8125rem] text-tinta-2">En este mes no hay semanas marcadas.</p>;
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Semanas de este mes">
      {weeks.map((w) => (
        <li key={w.from}>
          <button
            type="button"
            disabled={readOnly}
            aria-pressed={selectedFrom === w.from}
            onClick={() => onPick(w.from)}
            className={cx(
              "presionable num flex h-9 items-center gap-2 rounded-sm border px-2.5 text-[0.8125rem] text-tinta md:h-8",
              selectedFrom === w.from ? "border-linea-fuerte bg-hoja-3" : "border-linea bg-hoja-2 hover:bg-hoja-3"
            )}
          >
            <span aria-hidden="true" className={cx("h-2.5 w-2.5 rounded-[3px]", SWATCH_CLASS[w.band])} />
            {formatDayShort(w.from)} – {w.to ? formatDayShort(w.to) : "en curso"} · {plural(w.days, "día")}
          </button>
        </li>
      ))}
    </ul>
  );
}
