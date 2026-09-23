import { supabaseAdmin } from "@/lib/supabase";
import { formatCOP } from "@/lib/constants";
import { weekRange } from "@/lib/weeks";
import PurchaseForm from "@/components/admin/PurchaseForm";
import ProviderPaymentForm from "@/components/admin/ProviderPaymentForm";
import type { Purchase, ProviderPayment } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ComprasPage() {
  const [{ data: purchases }, { data: payments }] = await Promise.all([
    supabaseAdmin
      .from("purchases")
      .select("*")
      .order("purchase_date", { ascending: false })
      .limit(30),
    supabaseAdmin
      .from("provider_payments")
      .select("*")
      .order("payment_date", { ascending: false })
      .limit(30),
  ]);

  const purchaseList = (purchases as Purchase[]) ?? [];
  const paymentList = (payments as ProviderPayment[]) ?? [];

  const totalCompradoTodo = purchaseList.reduce((sum, p) => sum + Number(p.total_cost), 0);
  const totalPagadoTodo = paymentList.reduce((sum, p) => sum + Number(p.amount), 0);

  const { start, end } = weekRange();
  const inWeek = (dateStr: string) => {
    const d = new Date(`${dateStr}T00:00:00`);
    return d >= start && d <= end;
  };
  const compradoSemana = purchaseList
    .filter((p) => inWeek(p.purchase_date))
    .reduce((sum, p) => sum + Number(p.total_cost), 0);
  const pagadoSemana = paymentList
    .filter((p) => inWeek(p.payment_date))
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-zinc-500">Comprado (semana actual)</p>
          <p className="mt-1 text-lg font-bold text-zinc-900">{formatCOP(compradoSemana)}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-zinc-500">Pagado (semana actual)</p>
          <p className="mt-1 text-lg font-bold text-zinc-900">{formatCOP(pagadoSemana)}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-zinc-500">Comprado (todo)</p>
          <p className="mt-1 text-lg font-bold text-zinc-900">{formatCOP(totalCompradoTodo)}</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <p className="text-xs text-amber-800">Saldo con proveedor</p>
          <p className="mt-1 text-lg font-bold text-amber-950">
            {formatCOP(totalCompradoTodo - totalPagadoTodo)}
          </p>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <PurchaseForm />
        <ProviderPaymentForm />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <h2 className="mb-2 text-sm font-semibold text-zinc-900">Compras recientes</h2>
          {purchaseList.length === 0 ? (
            <p className="text-sm text-zinc-400">Aún no hay compras registradas.</p>
          ) : (
            <div className="space-y-2">
              {purchaseList.map((p) => (
                <div
                  key={p.id}
                  className="rounded-xl border border-zinc-200 bg-white p-3 text-sm shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-zinc-900">{p.purchase_date}</span>
                    <span className="font-semibold text-zinc-900">
                      {formatCOP(Number(p.total_cost))}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">
                    {p.kg} kg{p.description ? ` · ${p.description}` : ""}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-2 text-sm font-semibold text-zinc-900">Pagos al proveedor</h2>
          {paymentList.length === 0 ? (
            <p className="text-sm text-zinc-400">Aún no hay pagos registrados.</p>
          ) : (
            <div className="space-y-2">
              {paymentList.map((p) => (
                <div
                  key={p.id}
                  className="rounded-xl border border-zinc-200 bg-white p-3 text-sm shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-zinc-900">{p.payment_date}</span>
                    <span className="font-semibold text-zinc-900">
                      {formatCOP(Number(p.amount))}
                    </span>
                  </div>
                  {(p.method || p.notes) && (
                    <p className="text-xs text-zinc-500">
                      {[p.method, p.notes].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
