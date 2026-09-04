import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import { toKg, formatCOP } from "@/lib/constants";
import type { Order } from "@/lib/types";

export const dynamic = "force-dynamic";

type Range = "hoy" | "semana" | "mes" | "todo";

const RANGE_LABELS: Record<Range, string> = {
  hoy: "Hoy",
  semana: "Últimos 7 días",
  mes: "Últimos 30 días",
  todo: "Todo",
};

function rangeStart(range: Range): Date | null {
  const now = new Date();
  if (range === "hoy") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  if (range === "semana") {
    return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
  if (range === "mes") {
    return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
  return null;
}

export default async function GananciasPage({
  searchParams,
}: {
  searchParams: Promise<{ rango?: string }>;
}) {
  const { rango } = await searchParams;
  const range: Range =
    rango === "hoy" || rango === "semana" || rango === "mes" || rango === "todo"
      ? rango
      : "mes";

  let query = supabaseAdmin
    .from("orders")
    .select("quantity, unit, total, amount_paid, price_per_kg_snapshot, cost_per_kg_snapshot, created_at");

  const start = rangeStart(range);
  if (start) query = query.gte("created_at", start.toISOString());

  const { data: orders } = await query;
  const list =
    (orders as Pick<
      Order,
      "quantity" | "unit" | "total" | "amount_paid" | "price_per_kg_snapshot" | "cost_per_kg_snapshot" | "created_at"
    >[]) ?? [];

  const revenue = list.reduce((sum, o) => sum + Number(o.total), 0);
  const collected = list.reduce((sum, o) => sum + Number(o.amount_paid), 0);
  const cost = list.reduce(
    (sum, o) => sum + toKg(Number(o.quantity), o.unit) * Number(o.cost_per_kg_snapshot),
    0
  );
  const profit = revenue - cost;
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

  return (
    <div>
      <div className="mb-6 flex gap-1 rounded-full bg-zinc-100 p-1 text-sm">
        {(Object.keys(RANGE_LABELS) as Range[]).map((r) => (
          <Link
            key={r}
            href={`/admin/ganancias?rango=${r}`}
            className={`rounded-full px-3 py-1.5 font-medium transition-colors ${
              range === r ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            {RANGE_LABELS[r]}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-zinc-500">Ingresos (pedidos)</p>
          <p className="mt-1 text-lg font-bold text-zinc-900">{formatCOP(revenue)}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-zinc-500">Cobrado</p>
          <p className="mt-1 text-lg font-bold text-zinc-900">{formatCOP(collected)}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-zinc-500">Costo estimado</p>
          <p className="mt-1 text-lg font-bold text-zinc-900">{formatCOP(cost)}</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <p className="text-xs text-amber-800">Ganancia</p>
          <p className="mt-1 text-lg font-bold text-amber-950">
            {formatCOP(profit)}{" "}
            <span className="text-xs font-medium text-amber-700">({margin.toFixed(0)}%)</span>
          </p>
        </div>
      </div>

      <p className="mt-4 text-xs text-zinc-400">
        {list.length} pedido{list.length === 1 ? "" : "s"} en este rango · La ganancia se calcula
        con el costo por kg que configures en Pedidos. Si lo dejas en 0, la ganancia será igual a
        los ingresos.
      </p>
    </div>
  );
}
