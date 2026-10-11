"use client";

import { useEffect, useRef, useState } from "react";
import { formatCOP } from "@/lib/format";

export type ValueFormat = "cop" | "kg" | "pct";

// Eje Y: formato compacto ("$1,2 M", "$850 k") para que quepa en 56px.
export function formatAxis(value: number, format: ValueFormat): string {
  if (format === "pct") return `${Math.round(value)} %`;
  if (format === "kg") return `${Math.round(value)} kg`;
  const abs = Math.abs(value);
  const sign = value < 0 ? "−" : "";
  if (abs >= 1_000_000) {
    const m = (abs / 1_000_000).toFixed(1).replace(".", ",").replace(/,0$/, "");
    return `${sign}$${m} M`;
  }
  if (abs >= 1_000) return `${sign}$${Math.round(abs / 1_000)} k`;
  return `${sign}$${Math.round(abs)}`;
}

// Tooltip y etiquetas: valor completo.
export function formatFull(value: number, format: ValueFormat): string {
  if (format === "pct") return `${value.toFixed(0)} %`;
  if (format === "kg") return `${value.toLocaleString("es-CO", { maximumFractionDigits: 1 })} kg`;
  return (value < 0 ? "−" : "") + formatCOP(Math.abs(value));
}

// Máximo "redondo" para el eje: 1, 2, 2.5, 5 o 10 por potencia de diez.
export function niceScale(min: number, max: number, ticks = 4) {
  const lo = Math.min(0, min);
  const hi = Math.max(max, 1);
  const rawStep = (hi - lo) / ticks;
  const mag = 10 ** Math.floor(Math.log10(rawStep));
  const norm = rawStep / mag;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag;
  const niceMin = Math.floor(lo / step) * step;
  const niceMax = Math.ceil(hi / step) * step;
  const values: number[] = [];
  for (let v = niceMin; v <= niceMax + step / 2; v += step) values.push(v);
  return { min: niceMin, max: niceMax, ticks: values };
}

// Mide el ancho real del contenedor para que el texto del SVG no se encoja en móvil.
export function useChartWidth(fallback = 640) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(fallback);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(el.clientWidth || fallback);
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.max(280, Math.round(entry.contentRect.width)));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [fallback]);

  return { ref, width };
}
