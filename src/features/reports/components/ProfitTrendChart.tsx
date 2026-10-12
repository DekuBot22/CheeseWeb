import type { WeekPoint } from "@/domain/accounting";
import { formatCOP } from "@/lib/format";
import { ChartFrame } from "@/ui/charts/ChartFrame";
import { LineChart } from "@/ui/charts/LineChart";

// Ganancia de cada semana (puede ser negativa si el costo superó lo vendido).
export function ProfitTrendChart({ weeks }: { weeks: WeekPoint[] }) {
  const last = weeks[weeks.length - 1];
  return (
    <ChartFrame
      title="Ganancia por semana"
      subtitle={`Últimas ${weeks.length} semanas, de sábado a viernes`}
      table={{
        headers: ["Semana", "Ganancia"],
        rows: weeks.map((w) => [w.label, formatCOP(w.stats.profit)]),
      }}
    >
      <LineChart
        height={220}
        label="Ganancia"
        format="cop"
        ariaLabel={`Ganancia de las últimas ${weeks.length} semanas. Semana del ${last.label}: ${formatCOP(last.stats.profit)}.`}
        data={weeks.map((w) => ({ label: w.label, value: Math.round(w.stats.profit) }))}
      />
    </ChartFrame>
  );
}
