"use client";

import { useState } from "react";
import { formatCOP, formatDate } from "@/lib/constants";
import type { Order } from "@/lib/types";

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
        {orders.map((order) => (
          <div
            key={order.id}
            className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-semibold text-zinc-900">{order.client_name}</p>
              <p className="text-sm text-zinc-500">
                {order.quantity} {order.unit} · {formatCOP(order.total)}
              </p>
              <p className="text-xs text-zinc-400">{formatDate(order.created_at)}</p>
            </div>
            <button
              onClick={() => toggleStatus(order)}
              disabled={updatingId === order.id}
              className={`self-start rounded-full px-3 py-1 text-xs font-semibold sm:self-auto ${
                order.status === "pendiente"
                  ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                  : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
              } disabled:opacity-60`}
            >
              {order.status === "pendiente" ? "Pendiente · marcar listo" : "Completado ✓"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
