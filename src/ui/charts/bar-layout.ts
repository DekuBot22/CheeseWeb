import { niceScale } from "./scale";

export interface BarSeries {
  key: string;
  label: string;
  color: string;
}

export interface BarDatum {
  label: string;
  values: Record<string, number>;
  // Series cuyo valor en esta semana es una estimación (se dibujan rayadas).
  estimated?: string[];
}

export type BarMode = "grouped" | "stacked";

export const MARGIN = { l: 56, r: 8, t: 8, b: 26 };
const BAR_GAP = 2;

// Barra con las dos esquinas de arriba redondeadas, apoyada en la línea base.
export function roundedTop({ x, y, w, h, r }: { x: number; y: number; w: number; h: number; r: number }) {
  if (h <= 0 || w <= 0) return "";
  const rr = Math.min(r, w / 2, h);
  return `M${x},${y + h}V${y + rr}Q${x},${y} ${x + rr},${y}H${x + w - rr}Q${x + w},${y} ${x + w},${y + rr}V${y + h}Z`;
}

export interface BarLayout {
  innerH: number;
  slot: number;
  barW: number;
  groupW: number;
  labelEvery: number;
  ticks: number[];
  y: (value: number) => number;
  scaleMax: number;
}

// Medidas del gráfico: ancho de cada semana y de cada barra, escala del eje Y.
export function computeBarLayout(args: {
  width: number;
  height: number;
  data: BarDatum[];
  series: BarSeries[];
  mode: BarMode;
}): BarLayout {
  const { width, height, data, series, mode } = args;
  const innerW = width - MARGIN.l - MARGIN.r;
  const innerH = height - MARGIN.t - MARGIN.b;
  const slot = innerW / Math.max(data.length, 1);

  const positive = (d: BarDatum, key: string) => Math.max(d.values[key] ?? 0, 0);
  const maxValue = Math.max(
    ...data.map((d) =>
      mode === "stacked"
        ? series.reduce((sum, s) => sum + positive(d, s.key), 0)
        : Math.max(...series.map((s) => positive(d, s.key)))
    ),
    0
  );
  const scale = niceScale(0, maxValue);

  const k = mode === "grouped" ? series.length : 1;
  const barW = mode === "grouped" ? Math.min(28, (slot * 0.7 - BAR_GAP * (k - 1)) / k) : Math.min(36, slot * 0.6);

  return {
    innerH,
    slot,
    barW,
    groupW: barW * k + BAR_GAP * (k - 1),
    labelEvery: data.length > 8 ? 2 : 1,
    ticks: scale.ticks,
    scaleMax: scale.max,
    y: (v: number) => MARGIN.t + innerH - (v / scale.max) * innerH,
  };
}
