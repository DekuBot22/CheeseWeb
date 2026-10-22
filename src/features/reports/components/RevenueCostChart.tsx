import type { WeekPoint } from "@/domain/accounting";
import { formatCOP, weekTitle } from "@/lib/format";
import { BarChart } from "@/ui/charts/BarChart";
import { ChartFrame } from "@/ui/charts/ChartFrame";

const SERIES = [
  { key: "cobrado", label: "Cobrado", color: "var(--cobrado)" },
  { key: "costo", label: "Costo", color: "var(--cat-4)" },
];

// Lo cobrado frente a su costo por semana (la diferencia es la ganancia).
export function RevenueCostChart({
  weeks,
  title,
  subtitle,
  ariaLabel,
}: {
  weeks: WeekPoint[];
  title: string;
  subtitle: string;
  ariaLabel: string;
}) {
  return (
    <ChartFrame
      title={title}
      subtitle={subtitle}
      legend={SERIES}
      table={{
        headers: ["Semana", "Cobrado", "Costo", "Ganancia"],
        rows: weeks.map((w) => [weekTitle(w.label, w.days), formatCOP(w.stats.collected), formatCOP(w.stats.cost), formatCOP(w.stats.profit)]),
      }}
    >
      <BarChart
        ariaLabel={ariaLabel}
        series={SERIES}
        data={weeks.map((w) => ({
          label: w.label,
          values: { cobrado: w.stats.collected, costo: w.stats.cost },
        }))}
      />
    </ChartFrame>
  );
}
