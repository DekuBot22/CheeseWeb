"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function ProviderPaymentForm() {
  const router = useRouter();
  const [date, setDate] = useState(today());
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/admin/provider-payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_date: date,
          amount: Number(amount),
          method: method || undefined,
          notes: notes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo registrar el pago");
        setStatus("error");
        return;
      }
      setAmount("");
      setMethod("");
      setNotes("");
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
      <h2 className="mb-3 text-sm font-semibold text-zinc-900">Nuevo pago al proveedor</h2>

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
          <span className="mb-1 block text-xs font-medium text-zinc-600">Monto</span>
          <input
            type="number"
            step="0.01"
            min="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Ej. 500000"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-zinc-600">
            Método (opcional)
          </span>
          <input
            type="text"
            maxLength={50}
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            placeholder="Efectivo, transferencia..."
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
          />
        </label>
      </div>

      <label className="mb-3 block">
        <span className="mb-1 block text-xs font-medium text-zinc-600">Nota (opcional)</span>
        <input
          type="text"
          maxLength={300}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
        />
      </label>

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60"
      >
        {status === "loading" ? "Guardando..." : "Registrar pago"}
      </button>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </form>
  );
}
