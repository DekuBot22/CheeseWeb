"use client";

import { useState } from "react";
import Link from "next/link";
import {
  formatCOP,
  formatDate,
  CHEESE_TYPE_LABELS,
  SALT_LEVEL_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/lib/constants";
import type { Order } from "@/lib/types";

const PAYMENT_BADGE: Record<Order["payment_status"], string> = {
  debe: "bg-red-100 text-red-800",
  parcial: "bg-amber-100 text-amber-800",
  pagado: "bg-emerald-100 text-emerald-800",
};

function PaymentForm({
  order,
  onPaid,
}: {
  order: Order;
  onPaid: (order: Order) => void;
}) {
  const [open, setOpen] = useState(false);
  const remaining = Math.max(order.total - order.amount_paid, 0);
  const [amount, setAmount] = useState(String(remaining));
  const [method, setMethod] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setError("Ingresa un monto válido");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: value, method: method || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo registrar el abono");
        setLoading(false);
        return;
      }
      onPaid(data.order);
      setOpen(false);
    } catch {
      setError("No se pudo conectar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (order.payment_status === "pagado") return null;

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold text-white hover:bg-zinc-800"
      >
        Registrar abono
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 rounded-lg bg-zinc-50 p-3">
      <div className="flex gap-2">
        <input
          type="number"
          step="0.01"
          min="0.01"
          autoFocus
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-28 rounded-lg border border-zinc-300 px-2 py-1 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
        />
        <input
          type="text"
          placeholder="Método (opcional)"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="flex-1 rounded-lg border border-zinc-300 px-2 py-1 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-amber-600 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
        >
          {loading ? "Guardando..." : "Confirmar"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg px-3 py-1 text-xs font-medium text-zinc-500 hover:text-zinc-800"
        >
          Cancelar
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </form>
  );
}

export default function OrdersTable({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function toggleStatus(order: Order) {
    const nextStatus = order.status === "pendiente" ? "completado" : "pendiente";
    setUpdatingId(order.id);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === order.id ? { ...o, status: nextStatus } : o))
        );
      }
    } finally {
      setUpdatingId(null);
    }
  }

  function handlePaid(updated: Order) {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500">
        Todavía no hay pedidos.
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold text-zinc-900">Pedidos ({orders.length})</h2>
      <div className="space-y-3">
        {orders.map((order) => {
          const remaining = Math.max(order.total - order.amount_paid, 0);
          return (
            <div
              key={order.id}
              className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  {order.client_id ? (
                    <Link
                      href={`/admin/clientes/${order.client_id}`}
                      className="font-semibold text-zinc-900 hover:underline"
                    >
                      {order.client_name}
                    </Link>
                  ) : (
                    <p className="font-semibold text-zinc-900">{order.client_name}</p>
                  )}
                  <p className="text-sm text-zinc-500">
                    {order.quantity} {order.unit} · {formatCOP(order.total)}
                  </p>
                  <p className="text-sm text-zinc-500">
                    {CHEESE_TYPE_LABELS[order.cheese_type]} · {SALT_LEVEL_LABELS[order.salt_level]}
                  </p>
                  <p className="text-xs text-zinc-400">{formatDate(order.created_at)}</p>
                </div>

                <div className="flex flex-col items-start gap-2 sm:items-end">
                  <button
                    onClick={() => toggleStatus(order)}
                    disabled={updatingId === order.id}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      order.status === "pendiente"
                        ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                        : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                    } disabled:opacity-60`}
                  >
                    {order.status === "pendiente" ? "Pendiente · marcar listo" : "Completado ✓"}
                  </button>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${PAYMENT_BADGE[order.payment_status]}`}
                  >
                    {PAYMENT_STATUS_LABELS[order.payment_status]}
                    {order.payment_status !== "pagado" && ` · debe ${formatCOP(remaining)}`}
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <PaymentForm order={order} onPaid={handlePaid} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
