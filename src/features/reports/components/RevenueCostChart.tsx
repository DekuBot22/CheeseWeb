import type { WeekPoint } from "@/domain/accounting";
import { formatCOP } from "@/lib/format";
import { BarChart } from "@/ui/charts/BarChart";
import { ChartFrame } from "@/ui/charts/ChartFrame";

const SERIES = [
  { key: "ingresos", label: "Ingresos", color: "var(--serie-1)" },
  { key: "costo", label: "Costo", color: "var(--serie-2)" },
];

const isEstimated = (w: WeekPoint) => !w.stats.usingRealCost && w.stats.revenue > 0;

// Ingresos frente a costo por semana. Las barras de costo estimado van rayadas.
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
      note={
        weeks.some(isEstimated)
          ? "Las barras de costo rayadas son estimadas (sin compras registradas esa semana)."
          : undefined
      }
      table={{
        headers: ["Semana", "Ingresos", "Costo", "Ganancia"],
        rows: weeks.map((w) => [w.label, formatCOP(w.stats.revenue), formatCOP(w.stats.cost), formatCOP(w.stats.profit)]),
      }}
    >
      <BarChart
        ariaLabel={ariaLabel}
        series={SERIES}
        data={weeks.map((w) => ({
          label: w.label,
          values: { ingresos: w.stats.revenue, costo: w.stats.cost },
          estimated: isEstimated(w) ? ["costo"] : [],
        }))}
      />
    </ChartFrame>
  );
}
