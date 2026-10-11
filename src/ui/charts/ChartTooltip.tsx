// Tooltip común de las gráficas: título y una fila por serie con su color.
export function ChartTooltip({
  left,
  title,
  rows,
  widthClass = "w-44",
}: {
  left: number;
  title: string;
  rows: { label: string; value: string; color?: string }[];
  widthClass?: string;
}) {
  return (
    <div
      className={`pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-md border border-linea-fuerte/50 bg-hoja-3 p-2.5 text-xs shadow-flota ${widthClass}`}
      style={{ left }}
    >
      <p className="mb-1 font-semibold text-tinta">{title}</p>
      {rows.map((r) => (
        <p key={r.label} className="flex items-center justify-between gap-2 text-tinta-2">
          <span className="flex items-center gap-1.5">
            {r.color && <span className="inline-block h-2 w-2 rounded-sm" style={{ background: r.color }} />}
            {r.label}
          </span>
          <span className="num font-semibold text-tinta">{r.value}</span>
        </p>
      ))}
    </div>
  );
}
