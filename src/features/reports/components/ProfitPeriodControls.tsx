import { bogotaDate } from "@/lib/bogota-time";
import { shiftWeek } from "@/domain/week";
import { formatWeekLabel } from "@/lib/format";
import { SegmentedControl } from "@/ui/SegmentedControl";
import { WeekPicker } from "@/ui/WeekPicker";
import type { ProfitView } from "../profit-views";

const href = (view: string, extra = "") => `/admin/ganancias?vista=${view}${extra}`;

// Selector de período (semana / 12 semanas / todo) y, en vista semanal, la navegación entre semanas.
export function ProfitPeriodControls({
  view,
  week,
  isCurrent,
}: {
  view: ProfitView;
  week: { start: Date; end: Date };
  isCurrent: boolean;
}) {
  const step = (delta: number) =>
    href("semana", `&semana=${bogotaDate(shiftWeek(week.start.toISOString(), delta))}`);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <SegmentedControl
        label="Período"
        value={view}
        options={[
          { value: "semana", label: "Semana", href: href("semana") },
          { value: "12", label: "12 semanas", href: href("12") },
          { value: "todo", label: "Todo", href: href("todo") },
        ]}
      />
      {view === "semana" && (
        <WeekPicker
          label={formatWeekLabel(week.start, week.end)}
          isCurrent={isCurrent}
          prevHref={step(-1)}
          nextHref={step(1)}
        />
      )}
    </div>
  );
}
