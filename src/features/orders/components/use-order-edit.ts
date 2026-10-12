"use client";

import { useState } from "react";
import { previewOrderEdit, sumActivePayments, type Order } from "@/domain/order";
import { toKg, type Unit } from "@/domain/units";
import type { OrderDetail } from "./use-order-detail";

// Formulario de edición: al cambiar cantidad o unidad el total se recalcula con
// el precio de ESE día (el del pedido), salvo que el dueño ya lo haya escrito a mano.
export function useOrderEdit(detail: OrderDetail, onDone: (order: Order) => void) {
  const { order, payments } = detail;
  const paidSum = sumActivePayments(payments);

  const [clientName, setClientName] = useState(order.client_name);
  const [quantity, setQuantity] = useState(String(order.quantity));
  const [unit, setUnit] = useState<Unit>(order.unit);
  const [total, setTotal] = useState(String(order.total));
  const [totalTouched, setTotalTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function estimate(q: string, u: Unit): string | null {
    const value = Number(q);
    if (!Number.isFinite(value) || value <= 0) return null;
    return String(Math.round(toKg(value, u) * Number(order.price_per_kg_snapshot)));
  }

  function changeQuantity(q: string) {
    setQuantity(q);
    const next = totalTouched ? null : estimate(q, unit);
    if (next) setTotal(next);
  }

  function changeUnit(u: Unit) {
    setUnit(u);
    const next = totalTouched ? null : estimate(quantity, u);
    if (next) setTotal(next);
  }

  function changeTotal(t: string) {
    setTotal(t);
    setTotalTouched(true);
  }

  const nextTotal = Number(total);
  const preview =
    paidSum > 0 && Number.isFinite(nextTotal) && nextTotal > 0
      ? previewOrderEdit({ total: Number(order.total), paidSum }, nextTotal)
      : null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_name: clientName, quantity, unit, total }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo guardar el pedido");
        return;
      }
      onDone(data.order);
    } catch {
      setError("No se pudo conectar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return {
    clientName,
    setClientName,
    quantity,
    changeQuantity,
    unit,
    changeUnit,
    total,
    changeTotal,
    paidSum,
    preview,
    loading,
    error,
    submit,
  };
}
