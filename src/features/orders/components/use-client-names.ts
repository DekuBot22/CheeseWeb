"use client";

import { useEffect, useState } from "react";

// Nombres de clientes para sugerir; se piden una sola vez al abrir la hoja de venta.
export function useClientNames(): string[] {
  const [names, setNames] = useState<string[]>([]);

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/clients")
      .then((res) => (res.ok ? res.json() : { clients: [] }))
      .then((data: { clients: { name: string }[] }) => alive && setNames(data.clients.map((c) => c.name)))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return names;
}
