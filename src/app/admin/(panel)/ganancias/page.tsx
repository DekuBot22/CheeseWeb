import { formatWeekLabel } from "@/lib/format";
import { pickParam } from "@/lib/search-params";
import { ProfitPeriodControls } from "@/features/reports/components/ProfitPeriodControls";
import { ProfitStats } from "@/features/reports/components/ProfitStats";
import { WeekTilesCard } from "@/features/reports/components/WeekTilesCard";
import { WeeklyLedgerTable } from "@/features/reports/components/WeeklyLedgerTable";
import { getProfitReport } from "@/features/reports/server/get-profit-report";
import { PROFIT_VIEWS } from "@/features/reports/profit-views";
import { ButtonLink, buttonClasses } from "@/ui/Button";
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
        stretchActions
        actions={
          <>
            <ButtonLink href="/admin/ganancias/graficas" variant="secondary" size="sm">
              Gráficas
            </ButtonLink>
            <a href={exportHref} className={buttonClasses("secondary", "sm")}>
              <IconDownload width={16} height={16} /> Excel
            </a>
          </>
        }
      />

      <ProfitPeriodControls
        view={view}
        week={r.week}
        isCurrent={r.isCurrent}
        neighbors={{ prev: r.prevWeek, next: r.nextWeek }}
      />

      <WeekTilesCard weeks={r.series.slice(-12)} now={r.now.getTime()} />

      <ProfitStats
        stats={r.stats}
        kg={r.kg}
        orderCount={r.orderCount}
        previous={view === "semana" ? r.previous?.stats : undefined}
      />

      <section aria-labelledby="libro">
        <h2 id="libro" className="mb-3 text-[0.9375rem]/[1.375rem] font-semibold text-tinta">
          Libro semanal
        </h2>
        <WeeklyLedgerTable weeks={r.visible} />
      </section>
    </div>
  );
}
