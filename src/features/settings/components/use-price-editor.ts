"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { perKgToPerLb, perLbToPerKg } from "@/domain/units";

// Estado del formulario de precio y costo. El dueño piensa y cobra por LIBRA, así
// que el formulario trabaja en libras; la base y la API siguen en kg, y la
// conversión se hace aquí, justo antes de enviar.
export function usePriceEditor(initialPrice: number | null, initialCost: number | null, updatedAt: string | null) {
  const router = useRouter();
  const [price, setPrice] = useState(initialPrice ? String(perKgToPerLb(initialPrice)) : "");
  const [cost, setCost] = useState(initialCost ? String(perKgToPerLb(initialCost)) : "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(updatedAt);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const priceLb = Number(price);
    const costLb = cost ? Number(cost) : 0;
    if (!Number.isFinite(priceLb) || priceLb <= 0) {
      setError("Ingresa el precio de venta por libra");
      return;
    }
    if (!Number.isFinite(costLb) || costLb < 0) {
      setError("El costo por libra no puede ser negativo");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price_per_kg: perLbToPerKg(priceLb), cost_per_kg: perLbToPerKg(costLb) }),
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
