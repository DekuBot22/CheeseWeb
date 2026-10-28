import { withWeekParam } from "@/lib/week-param";
import { SegmentedControl } from "@/ui/SegmentedControl";
import type { ChartWeeks } from "../chart-ranges";

const href = (weeks: ChartWeeks, semana: string | null) =>
  withWeekParam(`/admin/ganancias/graficas?semanas=${weeks}`, semana);

// Cuántas semanas ver en las gráficas.
// `semana`: la semana elegida (null = actual); las gráficas terminan en ella.
export function ChartsRangeControls({ weeks, semana = null }: { weeks: ChartWeeks; semana?: string | null }) {
  return (
    <div>
      <SegmentedControl
        label="Semanas a mostrar"
        value={weeks}
        options={[
          { value: "8", label: "8 semanas", href: href("8", semana) },
          { value: "12", label: "12 semanas", href: href("12", semana) },
          { value: "26", label: "26 semanas", href: href("26", semana) },
        ]}
      />
    </div>
  );
}
