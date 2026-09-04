"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatCOP, formatDate, KG_PER_LB } from "@/lib/constants";

export default function PriceEditor({
  initialPrice,
  initialCost,
  updatedAt,
}: {
  initialPrice: number | null;
  initialCost: number | null;
  updatedAt: string | null;
}) {
  const router = useRouter();
  const [price, setPrice] = useState(initialPrice ? String(initialPrice) : "");
  const [cost, setCost] = useState(initialCost ? String(initialCost) : "");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(updatedAt);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const priceValue = Number(price);
    const costValue = cost ? Number(cost) : 0;
    if (!Number.isFinite(priceValue) || priceValue <= 0) {
      setError("Ingresa un precio de venta válido");
      setStatus("error");
      return;
    }
    if (!Number.isFinite(costValue) || costValue < 0) {
      setError("Ingresa un costo válido");
      setStatus("error");
      return;
    }
    setStatus("loading");
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
        setStatus("error");
        return;
      }
      setLastUpdated(data.settings.updated_at);
      setStatus("idle");
      router.refresh();
    } catch {
      setError("No se pudo conectar. Intenta de nuevo.");
      setStatus("error");
    }
  }

  const priceNumber = Number(price);

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
    >
      <h2 className="mb-1 text-sm font-semibold text-zinc-900">Precio por kilogramo</h2>
      <p className="mb-4 text-xs text-zinc-500">
        {lastUpdated ? `Última actualización: ${formatDate(lastUpdated)}` : "Aún no configurado"}
      </p>

      <label className="mb-3 block">
        <span className="mb-1 block text-xs font-medium text-zinc-600">
          Precio de venta por kg (lo que paga el cliente)
        </span>
        <input
          type="number"
          step="0.01"
          min="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Ej. 25000"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
        />
      </label>

      <label className="mb-3 block">
        <span className="mb-1 block text-xs font-medium text-zinc-600">
          Costo por kg (lo que a ti te cuesta, opcional — para calcular ganancias)
        </span>
        <input
          type="number"
          step="0.01"
          min="0"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          placeholder="Ej. 15000"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
        />
      </label>

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
      >
        {status === "loading" ? "Guardando..." : "Guardar"}
      </button>

      {price && Number.isFinite(priceNumber) && priceNumber > 0 && (
        <p className="mt-2 text-xs text-zinc-500">
          Equivale a {formatCOP(priceNumber * KG_PER_LB)} por libra
        </p>
      )}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </form>
  );
}
