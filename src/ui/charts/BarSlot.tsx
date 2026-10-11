import { MARGIN, roundedTop, type BarDatum, type BarLayout, type BarMode, type BarSeries } from "./bar-layout";
import { formatFull, type ValueFormat } from "./scale";

export interface BarChartContext {
  layout: BarLayout;
  series: BarSeries[];
  mode: BarMode;
  uid: string;
  height: number;
  format: ValueFormat;
}

// Una semana del gráfico: sus barras, su etiqueta y el área sensible al cursor/teclado.
export function BarSlot({
  datum,
  index,
  active,
  onActive,
  chart,
}: {
  datum: BarDatum;
  index: number;
  active: boolean;
  onActive: (index: number | null) => void;
  chart: BarChartContext;
}) {
  const { layout, series, mode, uid, height, format } = chart;
  const cx = MARGIN.l + layout.slot * (index + 0.5);
  const valueOf = (key: string) => Math.max(datum.values[key] ?? 0, 0);

  return (
    <g>
      {active && <rect x={MARGIN.l + layout.slot * index} y={MARGIN.t} width={layout.slot} height={layout.innerH} fill="var(--hoja-3)" />}
      {series.map((s, si) => {
        const v = valueOf(s.key);
        const h = (v / layout.scaleMax) * layout.innerH;
        const x = mode === "grouped" ? cx - layout.groupW / 2 + si * (layout.barW + 2) : cx - layout.barW / 2;
        // En barras apiladas cada segmento empieza donde terminan los anteriores.
        const below = series.slice(0, si).reduce((sum, other) => sum + valueOf(other.key), 0);
        const top = mode === "grouped" ? layout.y(v) : layout.y(below + v);
        const estimated = datum.estimated?.includes(s.key);
        const gap = mode === "stacked" ? 2 : 0;
        return (
          <path
            key={s.key}
            d={roundedTop({ x, y: top, w: layout.barW, h: Math.max(h - gap, 0), r: 4 })}
            fill={estimated ? `url(#${uid}-hatch-${s.key})` : s.color}
            stroke={estimated ? s.color : undefined}
            strokeWidth={estimated ? 1 : undefined}
          />
        );
      })}
      {index % layout.labelEvery === 0 && (
        <text x={cx} y={height - 8} textAnchor="middle" fontSize={12} fill="var(--tinta-3)">
          {datum.label}
        </text>
      )}
      <rect
        x={MARGIN.l + layout.slot * index}
        y={MARGIN.t}
        width={layout.slot}
        height={layout.innerH + MARGIN.b}
        fill="transparent"
        tabIndex={0}
        aria-label={`${datum.label}: ${series
          .map((s) => `${s.label} ${formatFull(datum.values[s.key] ?? 0, format)}`)
          .join(", ")}`}
        onMouseEnter={() => onActive(index)}
        onMouseLeave={() => onActive(null)}
        onFocus={() => onActive(index)}
        onBlur={() => onActive(null)}
        onTouchStart={() => onActive(index)}
      />
    </g>
  );
}
