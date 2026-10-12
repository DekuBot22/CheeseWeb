import Link from "next/link";
import { SegmentedControl } from "@/ui/SegmentedControl";
import type { ChartWeeks } from "../chart-ranges";

const href = (weeks: ChartWeeks) => `/admin/ganancias/graficas?semanas=${weeks}`;

// Cuántas semanas ver en las gráficas, y el regreso a Ganancias.
export function ChartsRangeControls({ weeks }: { weeks: ChartWeeks }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <SegmentedControl
        label="Semanas a mostrar"
        value={weeks}
        options={[
          { value: "8", label: "8 semanas", href: href("8") },
          { value: "12", label: "12 semanas", href: href("12") },
          { value: "26", label: "26 semanas", href: href("26") },
        ]}
      />
      <Link href="/admin/ganancias" className="text-sm font-medium text-acento hover:underline">
        ← Ganancias
      </Link>
    </div>
  );
}
