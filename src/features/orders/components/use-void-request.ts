"use client";

import { useState } from "react";
import type { Order } from "@/domain/order";

// Envía una anulación (POST con motivo) y entrega el pedido ya recalculado.
export function useVoidRequest(url: string, onDone: (order: Order) => void) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function run(body: Record<string, unknown>) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo anular");
        return;
      }
      onDone(data.order);
    } catch {
      setError("No se pudo conectar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return { loading, error, run };
}
