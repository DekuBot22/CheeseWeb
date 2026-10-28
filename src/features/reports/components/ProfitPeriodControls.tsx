import type { Week } from "@/domain/week-calendar";
import { formatWeekLabel, plural } from "@/lib/format";
import { withWeekParam } from "@/lib/week-param";
import { SegmentedControl } from "@/ui/SegmentedControl";
import { WeekPicker } from "@/ui/WeekPicker";
import type { ProfitView } from "../profit-views";

const href = (view: string, semana: string | null) => withWeekParam(`/admin/ganancias?vista=${view}`, semana);

// "Sáb a vie" solo en la semana de siempre; si se abrió a mano o recortó, los días que duró.
const caption = (week: Week) => (week.manual || week.days !== 7 ? plural(week.days, "día") : "Sáb a vie");

// Selector de período (semana / 12 semanas / todo) y, en vista semanal, la navegación entre semanas.
export function ProfitPeriodControls({
  view,
  week,
  isCurrent,
  currentFrom,
  semana,
  neighbors,
}: {
  view: ProfitView;
  week: Week;
  isCurrent: boolean;
  // Primer día de la semana actual: un vecino que sea la actual deja la URL sin `semana`.
  currentFrom: string;
  // Semana elegida en la URL (null = actual): se conserva al cambiar de período.
  semana: string | null;
  neighbors: { prev: Week | null; next: Week | null };
}) {
  const step = (target: Week | null) =>
    target ? href("semana", target.from === currentFrom ? null : target.from) : undefined;
  const keep = semana;

  return (
    <div className="flex flex-col items-start gap-3 md:flex-row md:items-center md:gap-4">
      <SegmentedControl
        label="Período"
        value={view}
        options={[
          { value: "semana", label: "Semana", href: href("semana", keep) },
          { value: "12", label: "12 semanas", href: href("12", keep) },
          { value: "todo", label: "Todo", href: href("todo", keep) },
        ]}
      />
      {view === "semana" && (
        <WeekPicker
          label={formatWeekLabel(week.start, week.end)}
          caption={caption(week)}
          isCurrent={isCurrent}
          prevHref={step(neighbors.prev)}
          nextHref={step(neighbors.next)}
        />
      )}
    </div>
  );
}
