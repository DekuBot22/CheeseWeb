"use client";

import { useMemo, useState } from "react";
import { toKg, formatCOP, formatDate } from "@/lib/constants";

type Unit = "kg" | "lb";
type Status = "idle" | "loading" | "success" | "error";

export default function OrderForm({
  pricePerKg,
  updatedAt,
}: {
  pricePerKg: number;
  updatedAt: string | null;
}) {
  const [clientName, setClientName] = useState("");
  const [unit, setUnit] = useState<Unit>("kg");
  const [quantity, setQuantity] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const qtyNumber = Number(quantity);
  const total = useMemo(() => {
    if (!Number.isFinite(qtyNumber) || qtyNumber <= 0) return 0;
    return Math.round(toKg(qtyNumber, unit) * pricePerKg);
  }, [qtyNumber, unit, pricePerKg]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_name: clientName, quantity: qtyNumber, unit }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "Ocurrió un error, intenta de nuevo.");
        setStatus("error");
        return;
      }
      setStatus("success");
    } catch {
      setErrorMsg("No se pudo enviar el pedido. Revisa tu conexión.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center shadow-sm">
        <div className="mb-2 text-4xl">✅</div>
        <h2 className="text-lg font-semibold text-emerald-900">¡Pedido enviado!</h2>
        <p className="mt-1 text-sm text-emerald-800">
          Gracias {clientName}, tu pedido de {quantity} {unit} fue recibido. Te
          contactaremos para confirmarlo.
        </p>
        <button
          onClick={() => {
            setStatus("idle");
            setClientName("");
            setQuantity("");
          }}
          className="mt-4 text-sm font-medium text-emerald-700 underline underline-offset-2"
        >
          Hacer otro pedido
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-1 flex items-baseline justify-between rounded-xl bg-amber-100/70 px-4 py-3">
        <span className="text-sm font-medium text-amber-900">Precio por kg</span>
        <span className="text-lg font-bold text-amber-950">{formatCOP(pricePerKg)}</span>
      </div>
      {updatedAt && (
        <p className="mb-5 mt-1.5 text-xs text-amber-700">
          Actualizado el {formatDate(updatedAt)}
        </p>
      )}

      <label className="mb-4 block">
        <span className="mb-1 block text-sm font-medium text-zinc-700">Tu nombre</span>
        <input
          required
          minLength={2}
          maxLength={100}
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          placeholder="Ej. María Pérez"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
        />
      </label>

      <div className="mb-4">
        <span className="mb-1 block text-sm font-medium text-zinc-700">Unidad</span>
        <div className="grid grid-cols-2 gap-2">
          {(["kg", "lb"] as Unit[]).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnit(u)}
              className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                unit === u
                  ? "border-amber-600 bg-amber-600 text-white"
                  : "border-zinc-300 bg-white text-zinc-700 hover:border-amber-400"
              }`}
            >
              {u === "kg" ? "Kilogramos" : "Libras"}
            </button>
          ))}
        </div>
      </div>

      <label className="mb-5 block">
        <span className="mb-1 block text-sm font-medium text-zinc-700">
          Cantidad ({unit})
        </span>
        <input
          required
          type="number"
          step="0.01"
          min="0.01"
          max="1000"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Ej. 2"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
        />
      </label>

      <div className="mb-5 flex items-center justify-between border-t border-dashed border-zinc-200 pt-4">
        <span className="text-sm font-medium text-zinc-600">Total estimado</span>
        <span className="text-xl font-bold text-amber-950">{formatCOP(total)}</span>
      </div>

      {errorMsg && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-lg bg-amber-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-700 disabled:opacity-60"
      >
        {status === "loading" ? "Enviando..." : "Enviar pedido"}
      </button>
    </form>
  );
}
