import Link from "next/link";
import { formatWeekLabel } from "@/lib/format";
import { PendingOrdersList } from "@/features/orders/components/PendingOrdersList";
import { DashboardStats } from "@/features/reports/components/DashboardStats";
import { DebtorsCard } from "@/features/reports/components/DebtorsCard";
import { QuickActions } from "@/features/reports/components/QuickActions";
import { getDashboard } from "@/features/reports/server/get-dashboard";
import { WeekPrompt } from "@/features/weeks/components/WeekPrompt";
import { Callout } from "@/ui/Callout";
import { PageHeader } from "@/ui/PageHeader";

export const dynamic = "force-dynamic";

export default async function InicioPage() {
  const d = await getDashboard();
  const pricePerKg = d.settings ? Number(d.settings.price_per_kg) : 0;
  const costPerKg = d.settings ? Number(d.settings.cost_per_kg) : 0;

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Inicio"
        subtitle={`Semana ${formatWeekLabel(d.current.start, d.current.end)}`}
        actions={<QuickActions payable={d.openOrders} pricePerKg={pricePerKg} />}
      />

      <WeekPrompt week={{ ...d.weekPrompt, from: d.current.from }} />

      {pricePerKg <= 0 && (
        <Callout tone="aviso">
          Aún no has puesto el precio de venta. <Link href="/admin/ajustes" className="font-semibold underline">Configúralo en Ajustes</Link>{" "}
          para que la página pública pueda recibir pedidos.
        </Callout>
      )}

      {pricePerKg > 0 && costPerKg <= 0 && (
        <Callout tone="aviso">
          No has puesto lo que te cuesta cada libra, así que la ganancia sale igual a lo cobrado.{" "}
          <Link href="/admin/ajustes" className="font-semibold underline">Ponlo en Ajustes</Link>.
        </Callout>
      )}

      <DashboardStats
        week={{
          cur: d.cur,
          revenueChange: d.revenueChange,
          profitChange: d.profitChange,
          collectedPct: d.collectedPct,
        }}
        debt={{ total: d.debt.total, clients: d.debt.debtors.length }}
        provider={d.provider}
      />

      <div className="-mt-3 text-right">
        <Link href="/admin/ganancias/graficas" className="text-sm font-medium text-acento hover:underline">
          Ver gráficas →
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr] lg:gap-6">
        <DebtorsCard debtors={d.debt.debtors} />
        <PendingOrdersList orders={d.pending} />
      </div>
    </div>
  );
}
