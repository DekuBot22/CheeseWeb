"use client";

import { useEffect, useState } from "react";
import type { Order, Payment } from "@/domain/order";

export interface OrderDetail {
  order: Order;
  payments: Payment[];
}

// Carga el pedido con sus abonos al abrir la hoja de detalle. La hoja vuelve a
// montar su contenido en cada apertura, así que siempre arranca desde cero.
export function useOrderDetail(orderId: string) {
  const [state, setState] = useState<{ detail: OrderDetail | null; error: string }>({
    detail: null,
    error: "",
  });

  useEffect(() => {
    let alive = true;
    fetch(`/api/admin/orders/${orderId}`)
      .then(async (res) => {
        const data = await res.json();
        if (!alive) return;
        setState(res.ok ? { detail: data, error: "" } : { detail: null, error: data.error ?? "No se pudo cargar el pedido" });
      })
      .catch(() => alive && setState({ detail: null, error: "No se pudo conectar. Intenta de nuevo." }));
    return () => {
      alive = false;
    };
  }, [orderId]);

  return state;
}
