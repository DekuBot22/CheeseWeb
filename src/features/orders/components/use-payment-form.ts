"use client";

import { useMemo, useState } from "react";
import { remainingOf, type Order } from "@/domain/order";
import { paymentDateError } from "@/domain/payment-date";
import { bogotaDate } from "@/lib/bogota-time";

export type PayableOrder = Pick<Order, "id" | "client_name" | "total" | "amount_paid" | "created_at">;

// Estado del formulario de abono: qué cliente y qué pedido están elegidos, el
// monto (por defecto lo que falta) y el envío a la API.
//
// Ojo con el teclado: PaymentForm pone `autoFocus` en el monto, así que en Android el
// teclado se abre mientras la hoja sube (240 ms) y el viewport cambia de tamaño a mitad
// de la animación. Si en el teléfono se nota un tirón, hay dos salidas: enfocar el campo
// con un setTimeout de 240 ms (lo que dura la entrada) o quitar `autoFocus` en móvil.
// Se deja como está hasta probarlo en el dispositivo.
export function usePaymentForm(
  orders: PayableOrder[],
  initialOrderId: string | undefined,
  onDone: (order: Order) => void
) {
  const first = orders.find((o) => o.id === initialOrderId) ?? orders[0];

  const [clientName, setClientName] = useState(first.client_name);
  const [orderId, setOrderId] = useState(first.id);
  const [amount, setAmount] = useState(String(remainingOf(first)));
  const [method, setMethod] = useState("");
  // "Otra fecha": por defecto el abono es de hoy.
  const [otherDate, setOtherDate] = useState(false);
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Clientes con deuda, de mayor a menor.
  const clientNames = useMemo(() => {
    const totals = new Map<string, number>();
    for (const o of orders) totals.set(o.client_name, (totals.get(o.client_name) ?? 0) + remainingOf(o));
    return [...totals.entries()].sort((a, b) => b[1] - a[1]).map(([name]) => name);
  }, [orders]);

  const clientOrders = orders.filter((o) => o.client_name === clientName);
  const selected = orders.find((o) => o.id === orderId) ?? first;

  function pickClient(name: string) {
    setClientName(name);
    const oldest = orders.find((o) => o.client_name === name);
    if (oldest) {
      setOrderId(oldest.id);
      setAmount(String(remainingOf(oldest)));
    }
  }

  function pickOrder(id: string) {
    setOrderId(id);
    const order = orders.find((o) => o.id === id);
    if (order) setAmount(String(remainingOf(order)));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setError("Ingresa un monto válido");
      return;
    }
    if (otherDate && !date) {
      setError("Elige la fecha del abono");
      return;
    }
    const dateError = otherDate ? paymentDateError(date, selected.created_at, new Date()) : null;
    if (dateError) {
      setError(dateError);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/orders/${selected.id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: value, method: method || undefined, date: otherDate ? date : undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo registrar el abono");
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
    clientNames,
    clientName,
    clientOrders,
    selected,
    orderId,
    amount,
    setAmount,
    method,
    setMethod,
    otherDate,
    setOtherDate,
    date,
    setDate,
    // Entre el día del pedido y hoy.
    dateMin: bogotaDate(new Date(selected.created_at)),
    dateMax: bogotaDate(),
    loading,
    error,
    pickClient,
    pickOrder,
    submit,
  };
}
