import type { WeekPoint } from "@/domain/accounting";
import { formatCOP, weekTitle } from "@/lib/format";
import { BarChart } from "@/ui/charts/BarChart";
import { ChartFrame } from "@/ui/charts/ChartFrame";
import { LineChart } from "@/ui/charts/LineChart";

const SERIES = [{ key: "ganancia", label: "Ganancia", color: "var(--acento)" }];

// Ganancia de cada semana. En barras, con la última (la que se mira) resaltada; si alguna
// semana perdió plata se pasa a línea, que sí dibuja valores negativos (las barras no).
export function ProfitTrendChart({ weeks }: { weeks: WeekPoint[] }) {
  const last = weeks[weeks.length - 1];
  const ariaLabel = `Ganancia de las últimas ${weeks.length} semanas. Semana del ${weekTitle(last.label, last.days)}: ${formatCOP(last.stats.profit)}.`;
  const hasLoss = weeks.some((w) => w.stats.profit < 0);

  return (
    <ChartFrame
      title="Ganancia por semana"
      subtitle={`Últimas ${weeks.length} semanas, de sábado a viernes`}
      legend={hasLoss ? undefined : SERIES}
      table={{
        headers: ["Semana", "Ganancia"],
        rows: weeks.map((w) => [weekTitle(w.label, w.days), formatCOP(w.stats.profit)]),
      }}
    >
      {hasLoss ? (
        <LineChart
          height={220}
          label="Ganancia"
          format="cop"
          ariaLabel={ariaLabel}
          data={weeks.map((w) => ({ label: w.label, value: Math.round(w.stats.profit) }))}
        />
      ) : (
        <BarChart
          height={220}
          dimExceptLast
          ariaLabel={ariaLabel}
          series={SERIES}
          data={weeks.map((w) => ({ label: w.label, values: { ganancia: Math.round(w.stats.profit) } }))}
        />
      )}
    </ChartFrame>
  );
}
