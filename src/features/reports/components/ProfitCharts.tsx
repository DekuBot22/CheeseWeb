import type { WeekPoint } from "@/domain/accounting";
import { formatCOP, weekTitle } from "@/lib/format";
import { BarChart } from "@/ui/charts/BarChart";
import { ChartFrame } from "@/ui/charts/ChartFrame";
import { LineChart } from "@/ui/charts/LineChart";
import { RevenueCostChart } from "./RevenueCostChart";

const COLLECTED_SERIES = [
  { key: "cobrado", label: "Cobrado", color: "var(--cobrado)" },
  { key: "porcobrar", label: "Por cobrar", color: "var(--aviso)" },
];

const unpaid = (w: WeekPoint) => Math.max(w.stats.revenue - w.stats.collected, 0);

// Las tres gráficas de Ganancias: ingresos y costo, cobrado y por cobrar, y margen.
export function ProfitCharts({ weeks, selected }: { weeks: WeekPoint[]; selected: WeekPoint }) {
  return (
    <>
      <RevenueCostChart
        weeks={weeks}
        title="Cobrado y costo por semana"
        subtitle={weeks.length === 1 ? "Última semana" : `Últimas ${weeks.length} semanas`}
        ariaLabel={`Cobrado y costo de las últimas ${weeks.length} semanas. Semana del ${weekTitle(selected.label, selected.days)}: cobrado ${formatCOP(selected.stats.collected)}, costo ${formatCOP(selected.stats.cost)}.`}
      />

      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        <ChartFrame
          title="Cobrado y por cobrar"
          subtitle="De lo vendido cada semana"
          legend={COLLECTED_SERIES}
          table={{
            headers: ["Semana", "Cobrado", "Por cobrar"],
            rows: weeks.map((w) => [weekTitle(w.label, w.days), formatCOP(w.stats.collected), formatCOP(unpaid(w))]),
          }}
        >
          <BarChart
            mode="stacked"
            height={200}
            ariaLabel={`Cobrado y por cobrar de las últimas ${weeks.length} semanas.`}
            series={COLLECTED_SERIES}
            data={weeks.map((w) => ({
              label: w.label,
              values: { cobrado: Math.min(w.stats.collected, w.stats.revenue), porcobrar: unpaid(w) },
            }))}
          />
        </ChartFrame>

        <ChartFrame
          title="Margen por semana"
          subtitle="Ganancia como porcentaje de lo vendido"
          table={{
            headers: ["Semana", "Margen"],
            rows: weeks.map((w) => [weekTitle(w.label, w.days), `${w.stats.margin.toFixed(0)} %`]),
          }}
        >
          <LineChart
            height={200}
            label="Margen"
            format="pct"
            ariaLabel={`Margen de ganancia de las últimas ${weeks.length} semanas. Semana del ${weekTitle(selected.label, selected.days)}: ${selected.stats.margin.toFixed(0)} %.`}
            data={weeks.map((w) => ({ label: w.label, value: Number(w.stats.margin.toFixed(1)) }))}
          />
        </ChartFrame>
      </div>
    </>
  );
}
