"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function PurchaseForm() {
  const router = useRouter();
  const [date, setDate] = useState(today());
  const [kg, setKg] = useState("");
  const [totalCost, setTotalCost] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/admin/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purchase_date: date,
          kg: Number(kg),
          total_cost: Number(totalCost),
          description: description || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo registrar la compra");
        setStatus("error");
        return;
      }
      setKg("");
      setTotalCost("");
      setDescription("");
      setStatus("idle");
      router.refresh();
    } catch {
      setError("No se pudo conectar. Intenta de nuevo.");
      setStatus("error");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
    >
      <h2 className="mb-3 text-sm font-semibold text-zinc-900">Nueva compra al proveedor</h2>

      <label className="mb-3 block">
        <span className="mb-1 block text-xs font-medium text-zinc-600">Fecha</span>
        <input
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
        />
      </label>

      <div className="mb-3 grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-zinc-600">Kilogramos</span>
          <input
            type="number"
            step="0.01"
            min="0.01"
            required
            value={kg}
            onChange={(e) => setKg(e.target.value)}
            placeholder="Ej. 50"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-zinc-600">Costo total</span>
          <input
            type="number"
            step="0.01"
            min="0"
            required
            value={totalCost}
            onChange={(e) => setTotalCost(e.target.value)}
            placeholder="Ej. 900000"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
          />
        </label>
      </div>

      <label className="mb-3 block">
        <span className="mb-1 block text-xs font-medium text-zinc-600">
          Descripción (opcional)
        </span>
        <input
          type="text"
          maxLength={300}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ej. Lote del sábado"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
        />
      </label>

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
      >
        {status === "loading" ? "Guardando..." : "Registrar compra"}
      </button>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </form>
  );
}
