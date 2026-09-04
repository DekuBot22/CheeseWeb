"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatCOP } from "@/lib/constants";

export interface ClientRow {
  id: string;
  name: string;
  phone: string | null;
  credit_balance: number;
  total_debe: number;
  orders_count: number;
}

export default function ClientsList({ clients }: { clients: ClientRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(
      (c) => c.name.toLowerCase().includes(q) || (c.phone ?? "").includes(q)
    );
  }, [clients, query]);

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar cliente por nombre o teléfono..."
        className="mb-4 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
      />

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500">
          No hay clientes que coincidan.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((client) => (
            <Link
              key={client.id}
              href={`/admin/clientes/${client.id}`}
              className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm hover:border-amber-300"
            >
              <div>
                <p className="font-semibold text-zinc-900">{client.name}</p>
                <p className="text-xs text-zinc-500">
                  {client.orders_count} pedido{client.orders_count === 1 ? "" : "s"}
                  {client.phone ? ` · ${client.phone}` : ""}
                </p>
              </div>
              <div className="text-right">
                {client.total_debe > 0 && (
                  <p className="text-sm font-semibold text-red-700">
                    Debe {formatCOP(client.total_debe)}
                  </p>
                )}
                {client.credit_balance > 0 && (
                  <p className="text-sm font-semibold text-emerald-700">
                    A favor {formatCOP(client.credit_balance)}
                  </p>
                )}
                {client.total_debe <= 0 && client.credit_balance <= 0 && (
                  <p className="text-sm text-zinc-400">Al día</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
