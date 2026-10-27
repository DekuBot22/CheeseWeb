"use client";

import { useEffect, useState } from "react";
import type { EffectPreview } from "../types";

export interface EffectParams {
  action: "abrir" | "mover" | "anular" | "rango";
  date?: string;
  id?: string;
  // Solo "rango": inicio y fin de la semana (sin `until` = sigue en curso).
  from?: string;
  until?: string;
}

const DEBOUNCE_MS = 250;

// Pide la vista previa de una apertura cada vez que cambian los parámetros (con una pausa corta
// para no consultar en cada tecla). `params` en null = no hay nada que mostrar todavía.
export function useOpeningEffect(params: EffectParams | null) {
  const [state, setState] = useState<{ key: string; preview?: EffectPreview; error?: string }>({ key: "" });
  const key = params ? JSON.stringify(params) : "";

  useEffect(() => {
    if (!key) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const query = new URLSearchParams(JSON.parse(key));
        const res = await fetch(`/api/admin/week-openings/effect?${query}`, { signal: controller.signal });
        const data = await res.json();
        setState(res.ok ? { key, preview: data } : { key, error: data.error ?? "No se pudo calcular el cambio" });
      } catch {
        if (!controller.signal.aborted) setState({ key, error: "No se pudo calcular el cambio" });
      }
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [key]);

  // Solo vale lo que corresponde a los parámetros actuales; si no, sigue cargando.
  const current = state.key === key ? state : null;
  return { preview: current?.preview ?? null, error: current?.error ?? "", loading: !!key && !current };
}
