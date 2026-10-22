import type { WeekPoint } from "@/domain/accounting";
import { formatKg, weekTitle } from "@/lib/format";
import { BarChart } from "@/ui/charts/BarChart";
import { ChartFrame } from "@/ui/charts/ChartFrame";

const SERIES = [
  { key: "vendidos", label: "Vendidos", color: "var(--cobrado)" },
  { key: "comprados", label: "Comprados", color: "var(--cat-3)" },
];

// Kilos vendidos frente a kilos comprados: la diferencia es la merma o lo que quedó sin vender.
export function KgFlowChart({ weeks }: { weeks: WeekPoint[] }) {
  return (
    <ChartFrame
      title="Kilos vendidos y comprados"
      subtitle="Si compras más de lo que vendes, la diferencia es merma o queso por vender"
      legend={SERIES}
      table={{
        headers: ["Semana", "Vendidos", "Comprados"],
        rows: weeks.map((w) => [weekTitle(w.label, w.days), `${formatKg(w.kgSold)} kg`, `${formatKg(w.kgBought)} kg`]),
      }}
    >
      <BarChart
        height={200}
        format="kg"
        ariaLabel={`Kilos vendidos y comprados de las últimas ${weeks.length} semanas.`}
        series={SERIES}
        data={weeks.map((w) => ({ label: w.label, values: { vendidos: w.kgSold, comprados: w.kgBought } }))}
      />
    </ChartFrame>
  );
}
