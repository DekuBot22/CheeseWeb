"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// Estado del formulario de precio y costo: valida, guarda en la API y refresca la página.
export function usePriceEditor(initialPrice: number | null, initialCost: number | null, updatedAt: string | null) {
  const router = useRouter();
  const [price, setPrice] = useState(initialPrice ? String(initialPrice) : "");
  const [cost, setCost] = useState(initialCost ? String(initialCost) : "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(updatedAt);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const priceValue = Number(price);
    const costValue = cost ? Number(cost) : 0;
    if (!Number.isFinite(priceValue) || priceValue <= 0) {
      setError("Ingresa un precio de venta válido");
      return;
    }
    if (!Number.isFinite(costValue) || costValue < 0) {
      setError("Ingresa un costo válido");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price_per_kg: priceValue, cost_per_kg: costValue }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo actualizar el precio");
        return;
      }
      setLastUpdated(data.settings.updated_at);
      router.refresh();
    } catch {
      setError("No se pudo conectar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return { price, setPrice, cost, setCost, loading, error, lastUpdated, submit };
}
