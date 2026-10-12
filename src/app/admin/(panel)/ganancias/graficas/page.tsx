import { pickParam } from "@/lib/search-params";
import { ChartsRangeControls } from "@/features/reports/components/ChartsRangeControls";
import { DebtAgingCard } from "@/features/reports/components/DebtAgingCard";
import { KgFlowChart } from "@/features/reports/components/KgFlowChart";
import { ProfitCharts } from "@/features/reports/components/ProfitCharts";
import { ProfitTrendChart } from "@/features/reports/components/ProfitTrendChart";
import { CHART_WEEKS } from "@/features/reports/chart-ranges";
import { getChartsReport } from "@/features/reports/server/get-charts-report";
import { PageHeader } from "@/ui/PageHeader";

export const dynamic = "force-dynamic";

export default async function GraficasPage({ searchParams }: { searchParams: Promise<{ semanas?: string }> }) {
  const { semanas } = await searchParams;
  const range = pickParam(semanas, CHART_WEEKS);
  const r = await getChartsReport(Number(range));

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader title="Gráficas" subtitle="Cómo va el negocio semana a semana, de sábado a viernes." />
      <ChartsRangeControls weeks={range} />

      <ProfitTrendChart weeks={r.series} />
      <ProfitCharts weeks={r.series} selected={r.selected} />

      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        <KgFlowChart weeks={r.series} />
        <DebtAgingCard aging={r.aging} />
      </div>
    </div>
  );
}
