"use client";

import { useId, useState } from "react";
import { MARGIN, computeBarLayout, type BarDatum, type BarMode, type BarSeries } from "./bar-layout";
import { BarSlot } from "./BarSlot";
import { ChartTooltip } from "./ChartTooltip";
import { formatAxis, formatFull, useChartWidth, type ValueFormat } from "./scale";

export type { BarDatum, BarSeries } from "./bar-layout";

export function BarChart({
  data,
  series,
  mode = "grouped",
  height = 220,
  format = "cop",
  dimExceptLast = false,
  ariaLabel,
}: {
  data: BarDatum[];
  series: BarSeries[];
  mode?: BarMode;
  height?: number;
  format?: ValueFormat;
  // Apaga todas las barras menos la última (la semana que se mira).
  dimExceptLast?: boolean;
  ariaLabel: string;
}) {
  const uid = useId().replace(/:/g, "");
  const { ref, width } = useChartWidth();
  const [active, setActive] = useState<number | null>(null);

  const layout = computeBarLayout({ width, height, data, series, mode });
  const activeDatum = active !== null ? data[active] : null;
  const tipLeft = active !== null ? Math.min(Math.max(MARGIN.l + layout.slot * (active + 0.5), 90), width - 90) : 0;

  return (
    <div ref={ref} className="relative w-full">
      <svg width={width} height={height} role="img" aria-label={ariaLabel}>
        <defs>
          {series.map((s) => (
            <pattern
              key={s.key}
              id={`${uid}-hatch-${s.key}`}
              width="6"
              height="6"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <rect width="6" height="6" fill={s.color} fillOpacity="0.18" />
              <line x1="0" y1="0" x2="0" y2="6" stroke={s.color} strokeWidth="2" />
            </pattern>
          ))}
        </defs>

        {layout.ticks.map((t) => (
          <g key={t}>
            <line x1={MARGIN.l} x2={width - MARGIN.r} y1={layout.y(t)} y2={layout.y(t)} stroke="var(--linea)" strokeWidth={1} />
            <text x={MARGIN.l - 8} y={layout.y(t) + 4} textAnchor="end" fontSize={12} fill="var(--tinta-3)" className="num">
              {formatAxis(t, format)}
            </text>
          </g>
        ))}

        {data.map((d, i) => (
          <BarSlot
            key={d.label}
            datum={d}
            index={i}
            active={active === i}
            dim={dimExceptLast && i !== data.length - 1}
            onActive={setActive}
            chart={{ layout, series, mode, uid, height, format }}
          />
        ))}
      </svg>

      {activeDatum && (
        <ChartTooltip
          left={tipLeft}
          title={activeDatum.label}
          rows={series.map((s) => ({
            color: s.color,
            label: `${s.label}${activeDatum.estimated?.includes(s.key) ? " (est.)" : ""}`,
            value: formatFull(activeDatum.values[s.key] ?? 0, format),
          }))}
        />
      )}
    </div>
  );
}
