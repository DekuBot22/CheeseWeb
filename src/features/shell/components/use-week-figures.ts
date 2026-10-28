"use client";

import { useEffect, useState } from "react";
import type { WeekFigure } from "@/domain/week-figures";

type State = { status: "idle" | "error" } | { status: "ready"; byWeek: Map<string, WeekFigure> };

// Cifras de cada semana de la lista: "idle" = todavía cargando; se piden al abrirla (una vez) y se recuerdan mientras la página siga abierta.
export function useWeekFigures(open: boolean): State {
  const [state, setState] = useState<State>({ status: "idle" });
  const idle = state.status === "idle";

  useEffect(() => {
    if (!open || !idle) return;
    let alive = true;
    fetch("/api/admin/week-figures")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((body: { figures: WeekFigure[] }) => {
        if (alive) setState({ status: "ready", byWeek: new Map(body.figures.map((f) => [f.from, f])) });
      })
      .catch(() => alive && setState({ status: "error" }));
    return () => {
      alive = false;
    };
  }, [open, idle]);

  return state;
}
