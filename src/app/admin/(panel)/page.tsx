import { formatCOP, formatWeekLabel } from "@/lib/format";
import { PendingOrdersList } from "@/features/orders/components/PendingOrdersList";
import { DashboardStats } from "@/features/reports/components/DashboardStats";
import { DebtorsCard } from "@/features/reports/components/DebtorsCard";
import { QuickActions } from "@/features/reports/components/QuickActions";
import { RevenueCostChart } from "@/features/reports/components/RevenueCostChart";
import { DASHBOARD_WEEKS, getDashboard } from "@/features/reports/server/get-dashboard";
import { PriceSummaryCard } from "@/features/settings/components/PriceSummaryCard";
import { PageHeader } from "@/ui/PageHeader";

export const dynamic = "force-dynamic";

export default async function InicioPage() {
  const d = await getDashboard();

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Inicio"
        subtitle={`Semana ${formatWeekLabel(d.current.start, d.current.end)}`}
        actions={<QuickActions payable={d.openOrders} />}
      />

      <DashboardStats
        week={{
          cur: d.cur,
          series: d.series,
          revenueChange: d.revenueChange,
          profitChange: d.profitChange,
          collectedPct: d.collectedPct,
        }}
        debt={{ total: d.debt.total, clients: d.debt.debtors.length }}
        provider={d.provider}
      />

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr] lg:gap-6">
        <DebtorsCard debtors={d.debt.debtors} aging={d.debt.aging} />
        <PendingOrdersList orders={d.pending} />
      </div>

      <RevenueCostChart
        weeks={d.series}
        title={`Últimas ${DASHBOARD_WEEKS} semanas`}
        subtitle="Ingresos frente a costo, de sábado a viernes"
        ariaLabel={`Ingresos y costo de las últimas ${DASHBOARD_WEEKS} semanas. Última semana: ingresos ${formatCOP(d.cur.stats.revenue)}, costo ${formatCOP(d.cur.stats.cost)}.`}
      />

      <PriceSummaryCard
        pricePerKg={d.settings ? Number(d.settings.price_per_kg) : null}
        costPerKg={d.settings ? Number(d.settings.cost_per_kg) : null}
      />
    </div>
  );
}
