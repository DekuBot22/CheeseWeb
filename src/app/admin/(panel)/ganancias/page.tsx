import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import { formatCOP } from "@/lib/constants";
import { weekRange, shiftWeek, formatWeekLabel } from "@/lib/weeks";
import { computeStats, type PeriodStats } from "@/lib/accounting";
import type { Order, Purchase, ProviderPayment } from "@/lib/types";

export const dynamic = "force-dynamic";

async function loadRange(start: Date, end: Date | null) {
  let ordersQuery = supabaseAdmin
    .from("orders")
    .select(
      "quantity, unit, total, amount_paid, price_per_kg_snapshot, cost_per_kg_snapshot, created_at"
    )
    .gte("created_at", start.toISOString());
  if (end) ordersQuery = ordersQuery.lte("created_at", end.toISOString());

  let purchasesQuery = supabaseAdmin
    .from("purchases")
    .select("kg, total_cost, purchase_date")
    .gte("purchase_date", start.toISOString().slice(0, 10));
  if (end) purchasesQuery = purchasesQuery.lte("purchase_date", end.toISOString().slice(0, 10));

  let providerPaymentsQuery = supabaseAdmin
    .from("provider_payments")
    .select("amount, payment_date")
    .gte("payment_date", start.toISOString().slice(0, 10));
  if (end)
    providerPaymentsQuery = providerPaymentsQuery.lte(
      "payment_date",
      end.toISOString().slice(0, 10)
    );

  const [{ data: orders }, { data: purchases }, { data: providerPayments }] = await Promise.all([
    ordersQuery,
    purchasesQuery,
    providerPaymentsQuery,
  ]);

  return {
    orders: (orders as Order[]) ?? [],
    purchases: (purchases as Purchase[]) ?? [],
    providerPayments: (providerPayments as ProviderPayment[]) ?? [],
  };
}

export default async function GananciasPage({
  searchParams,
}: {
  searchParams: Promise<{ semana?: string; vista?: string }>;
}) {
  const { semana, vista } = await searchParams;

  if (vista === "todo") {
    const { orders, purchases, providerPayments } = await loadRange(new Date(0), null);
    const stats = computeStats(orders, purchases, providerPayments);
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <Link href="/admin/ganancias" className="text-sm font-medium text-amber-700">
            ◀ Ver por semana
          </Link>
          <span className="text-sm font-semibold text-zinc-700">Todo el tiempo</span>
        </div>
        <StatsGrid stats={stats} orderCount={orders.length} />
        <ExportLink start={new Date(0)} end={new Date()} label="Descargar Excel (todo)" />
      </div>
    );
  }

  const anchor = semana ? new Date(`${semana}T00:00:00`) : new Date();
  const { start, end } = weekRange(anchor);
  const { orders, purchases, providerPayments } = await loadRange(start, end);
  const stats = computeStats(orders, purchases, providerPayments);

  const prevWeekStart = shiftWeek(start.toISOString(), -1).toISOString().slice(0, 10);
  const nextWeekStart = shiftWeek(start.toISOString(), 1).toISOString().slice(0, 10);
  const isCurrentWeek = weekRange().start.getTime() === start.getTime();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Link
          href={`/admin/ganancias?semana=${prevWeekStart}`}
          className="text-sm font-medium text-amber-700 hover:text-amber-900"
        >
          ◀ Semana anterior
        </Link>
        <div className="text-center">
          <p className="text-sm font-semibold text-zinc-800">{formatWeekLabel(start, end)}</p>
          {isCurrentWeek && <p className="text-xs text-zinc-400">Semana actual</p>}
        </div>
        {isCurrentWeek ? (
          <span className="text-sm text-zinc-300">Semana siguiente ▶</span>
        ) : (
          <Link
            href={`/admin/ganancias?semana=${nextWeekStart}`}
            className="text-sm font-medium text-amber-700 hover:text-amber-900"
          >
            Semana siguiente ▶
          </Link>
        )}
      </div>

      <StatsGrid stats={stats} orderCount={orders.length} />

      <div className="mt-4 flex items-center justify-between">
        <Link href="/admin/ganancias?vista=todo" className="text-xs font-medium text-zinc-500 underline">
          Ver todo el tiempo
        </Link>
        <ExportLink start={start} end={end} label="Descargar Excel de esta semana" />
      </div>
    </div>
  );
}

function StatsGrid({ stats, orderCount }: { stats: PeriodStats; orderCount: number }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-zinc-500">Ingresos (pedidos)</p>
          <p className="mt-1 text-lg font-bold text-zinc-900">{formatCOP(stats.revenue)}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-zinc-500">Cobrado</p>
          <p className="mt-1 text-lg font-bold text-zinc-900">{formatCOP(stats.collected)}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-zinc-500">
            Costo {stats.usingRealCost ? "(compras registradas)" : "(estimado por kg)"}
          </p>
          <p className="mt-1 text-lg font-bold text-zinc-900">{formatCOP(stats.cost)}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-zinc-500">Pagado al proveedor</p>
          <p className="mt-1 text-lg font-bold text-zinc-900">{formatCOP(stats.pagadoProveedor)}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-zinc-500">Saldo con proveedor</p>
          <p className="mt-1 text-lg font-bold text-zinc-900">{formatCOP(stats.saldoProveedor)}</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <p className="text-xs text-amber-800">Ganancia</p>
          <p className="mt-1 text-lg font-bold text-amber-950">
            {formatCOP(stats.profit)}{" "}
            <span className="text-xs font-medium text-amber-700">
              ({stats.margin.toFixed(0)}%)
            </span>
          </p>
        </div>
      </div>

      <p className="mt-4 text-xs text-zinc-400">
        {orderCount} pedido{orderCount === 1 ? "" : "s"} en este período.
        {!stats.usingRealCost &&
          " El costo se calcula con el costo por kg que configures en Pedidos, porque aún no hay compras registradas en Compras esta semana."}
      </p>
    </>
  );
}

function ExportLink({ start, end, label }: { start: Date; end: Date; label: string }) {
  const params = new URLSearchParams({
    start: start.toISOString(),
    end: end.toISOString(),
  });
  return (
    <a
      href={`/api/admin/export?${params.toString()}`}
      className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:border-amber-400"
    >
      {label}
    </a>
  );
}
