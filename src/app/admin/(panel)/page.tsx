import { formatWeekLabel, plural } from "@/lib/format";
import { DebtorsCard } from "@/features/reports/components/DebtorsCard";
import { InicioBanner } from "@/features/reports/components/InicioBanner";
import { QuickActions } from "@/features/reports/components/QuickActions";
import { ReviewCard } from "@/features/reports/components/ReviewCard";
import { WeekSummaryCard } from "@/features/reports/components/WeekSummaryCard";
import { getDashboard } from "@/features/reports/server/get-dashboard";
import { profitDifference, weekSummaryNotes } from "@/features/reports/week-summary";
import { PageHeader } from "@/ui/PageHeader";

export const dynamic = "force-dynamic";

const HINT_NOTES = {
  compra: "Hoy registraste una compra, ¿llegó el queso?",
  largo: "Esta semana ya lleva muchos días, ¿llegó el queso?",
} as const;

export default async function InicioPage() {
  const d = await getDashboard();
  const pricePerKg = d.settings ? Number(d.settings.price_per_kg) : 0;
  const costPerKg = d.settings ? Number(d.settings.cost_per_kg) : 0;

  // Todo lo que pide atención va en un solo aviso, en este orden.
  const notes: string[] = [];
  if (d.weekHint) notes.push(HINT_NOTES[d.weekHint]);
  if (pricePerKg <= 0) {
    notes.push("Falta el precio de venta en Ajustes: sin él la página pública no recibe pedidos.");
  } else if (costPerKg <= 0) {
    notes.push("Falta el costo por libra en Ajustes: sin él la ganancia sale igual a lo cobrado.");
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        title="Inicio"
        subtitle={`Semana ${formatWeekLabel(d.current.start, d.current.end)} · ${plural(d.weekElapsed, "día")}`}
        stretchActions
        actions={<QuickActions payable={d.openOrders} pricePerKg={pricePerKg} week={d.weekContext} />}
      />

      <InicioBanner week={d.weekContext} hint={d.weekHint} notes={notes} />

      <WeekSummaryCard
        profit={d.cur.stats.profit}
        profitDiff={profitDifference(d.cur, d.prev)}
        revenue={d.cur.stats.revenue}
        orderCount={d.cur.orderCount}
        collected={d.cur.stats.collected}
        collectedPct={d.collectedPct}
        kgSold={d.cur.kgSold}
        notes={weekSummaryNotes(d.current, d.cur, d.prev, d.weekElapsed)}
      />

      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr] lg:items-start lg:gap-6">
        <DebtorsCard debtors={d.debt.debtors} total={d.debt.total} />
        <ReviewCard pending={d.pending} debtors={d.debt.debtors} providerBalance={d.provider.saldo} />
      </div>
    </div>
  );
}
