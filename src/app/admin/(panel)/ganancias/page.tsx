import { formatWeekLabel } from "@/lib/format";
import { pickParam } from "@/lib/search-params";
import { ProfitCharts } from "@/features/reports/components/ProfitCharts";
import { ProfitPeriodControls } from "@/features/reports/components/ProfitPeriodControls";
import { ProfitStats } from "@/features/reports/components/ProfitStats";
import { WeeklyLedgerTable } from "@/features/reports/components/WeeklyLedgerTable";
import { getProfitReport } from "@/features/reports/server/get-profit-report";
import { PROFIT_VIEWS } from "@/features/reports/profit-views";
import { buttonClasses } from "@/ui/Button";
import { Callout } from "@/ui/Callout";
import { IconDownload } from "@/ui/icons";
import { PageHeader } from "@/ui/PageHeader";

export const dynamic = "force-dynamic";

export default async function GananciasPage({
  searchParams,
}: {
  searchParams: Promise<{ semana?: string; vista?: string }>;
}) {
  const { semana, vista } = await searchParams;
  const view = pickParam(vista, PROFIT_VIEWS);
  const r = await getProfitReport(view, semana);

  const exportHref = `/api/admin/export?${new URLSearchParams({
    start: r.export.start.toISOString(),
    end: r.export.end.toISOString(),
  })}`;

  const period =
    view === "semana"
      ? formatWeekLabel(r.week.start, r.week.end)
      : view === "12"
        ? `Últimas 12 semanas hasta el ${formatWeekLabel(r.week.start, r.week.end).split(" – ")[1]}`
        : "Todo el tiempo";

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Ganancias"
        subtitle={period}
        actions={
          <a href={exportHref} className={buttonClasses("secondary", "sm")}>
            <IconDownload width={16} height={16} /> Excel
          </a>
        }
      />

      <ProfitPeriodControls view={view} week={r.week} isCurrent={r.isCurrent} />

      <ProfitStats
        stats={r.stats}
        kg={r.kg}
        orderCount={r.orderCount}
        previous={view === "semana" ? r.previous?.stats : undefined}
      />

      {r.estimatedWeeks.length > 0 && (
        <Callout tone="aviso">
          {r.estimatedWeeks.length === 1 ? "Una semana usa" : `${r.estimatedWeeks.length} semanas usan`} el costo{" "}
          <strong>estimado</strong> por kg porque no tienen compras registradas. Regístralas en Compras para ver la
          ganancia real.
        </Callout>
      )}

      <ProfitCharts weeks={r.visible} selected={r.selected} />

      <section aria-labelledby="libro">
        <h2 id="libro" className="mb-3 font-display text-lg font-semibold text-tinta">
          Libro semanal
        </h2>
        <WeeklyLedgerTable weeks={r.visible} />
      </section>
    </div>
  );
}
