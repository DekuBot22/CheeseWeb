"use client";

import { useState } from "react";
import { ChartTooltip } from "./ChartTooltip";
import { formatAxis, formatFull, niceScale, useChartWidth, type ValueFormat } from "./scale";

const M = { l: 56, r: 12, t: 8, b: 26 };

export function LineChart({
  data,
  label,
  height = 180,
  format = "pct",
  ariaLabel,
}: {
  data: { label: string; value: number }[];
  label: string;
  height?: number;
  format?: ValueFormat;
  ariaLabel: string;
}) {
  const { ref, width } = useChartWidth();
  const [active, setActive] = useState<number | null>(null);

  const innerW = width - M.l - M.r;
  const innerH = height - M.t - M.b;
  const values = data.map((d) => d.value);
  const scale = niceScale(Math.min(...values, 0), Math.max(...values, 0));
  const span = scale.max - scale.min || 1;
  const y = (v: number) => M.t + innerH - ((v - scale.min) / span) * innerH;
  const x = (i: number) => M.l + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
  const labelEvery = data.length > 8 ? 2 : 1;

  const path = data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(d.value)}`).join("");
  const act = active !== null ? data[active] : null;

  return (
    <div ref={ref} className="relative w-full">
      <svg width={width} height={height} role="img" aria-label={ariaLabel}>
        {scale.ticks.map((t) => (
          <g key={t}>
            <line
              x1={M.l}
              x2={width - M.r}
              y1={y(t)}
              y2={y(t)}
              stroke={t === 0 ? "var(--linea-fuerte)" : "var(--linea)"}
              strokeWidth={1}
            />
            <text x={M.l - 8} y={y(t) + 4} textAnchor="end" fontSize={12} fill="var(--tinta-3)" className="num">
              {formatAxis(t, format)}
            </text>
          </g>
        ))}

        <path d={path} fill="none" stroke="var(--acento)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

        {data.map((d, i) => (
          <g key={d.label}>
            <circle cx={x(i)} cy={y(d.value)} r={active === i ? 5 : 4} fill="var(--hoja)" stroke="var(--acento)" strokeWidth={2} />
            {i % labelEvery === 0 && (
              <text x={x(i)} y={height - 8} textAnchor="middle" fontSize={12} fill="var(--tinta-3)">
                {d.label}
              </text>
            )}
            <rect
              x={x(i) - innerW / data.length / 2}
              y={M.t}
              width={innerW / data.length}
              height={innerH + M.b}
              fill="transparent"
              tabIndex={0}
              aria-label={`${d.label}: ${label} ${formatFull(d.value, format)}`}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              onTouchStart={() => setActive(i)}
            />
          </g>
        ))}
      </svg>

      {act && active !== null && (
        <ChartTooltip
          left={Math.min(Math.max(x(active), 80), width - 80)}
          title={act.label}
          rows={[{ label, value: formatFull(act.value, format) }]}
          widthClass="w-40"
        />
      )}
    </div>
  );
}
