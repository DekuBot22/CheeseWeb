"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCOP } from "@/lib/constants";
import type { Client } from "@/lib/types";

export default function ClientEditor({ client }: { client: Client }) {
  const router = useRouter();
  const [phone, setPhone] = useState(client.phone ?? "");
  const [notes, setNotes] = useState(client.notes ?? "");
  const [status, setStatus] = useState<"idle" | "loading" | "saved" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch(`/api/admin/clients/${client.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, notes }),
      });
      if (!res.ok) {
        setStatus("error");
        return;
      }
      setStatus("saved");
      router.refresh();
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-lg font-bold text-zinc-900">{client.name}</h2>
        {client.credit_balance > 0 && (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
            Saldo a favor: {formatCOP(client.credit_balance)}
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-zinc-600">Teléfono</span>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Ej. 3001234567"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-zinc-600">Notas</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Ej. prefiere entrega los sábados"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
          />
        </label>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60"
          >
            {status === "loading" ? "Guardando..." : "Guardar"}
          </button>
          {status === "saved" && <span className="text-xs text-emerald-700">Guardado</span>}
          {status === "error" && <span className="text-xs text-red-600">Error al guardar</span>}
        </div>
      </form>
    </div>
  );
}
