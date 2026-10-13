import { sumWeeks, type WeekPoint } from "@/domain/accounting";
import { profitPerLb } from "@/domain/pricing";
import { formatCOP, formatKg, formatWeekLabel, plural } from "@/lib/format";
import { DataTable, type Column } from "@/ui/DataTable";
import { Money } from "@/ui/Money";

// Ganancia por libra de una semana; "—" si no se vendió nada.
const perLbText = (profit: number, kg: number) => {
  const v = profitPerLb(profit, kg);
  return v === null ? "—" : formatCOP(Math.round(v));
};

const COLUMNS: Column<WeekPoint>[] = [
  {
    key: "semana",
    header: "Semana",
    cell: (w) => (
      <span className="num">
        {w.label}
        <span className="text-tinta-3"> – {formatWeekLabel(w.start, w.end).split(" – ")[1].split(",")[0]}</span>
      </span>
    ),
  },
  { key: "kg", header: "Kg", align: "right", cell: (w) => formatKg(w.kgSold) },
  { key: "ing", header: "Vendido", align: "right", cell: (w) => <Money value={w.stats.revenue} /> },
  { key: "cob", header: "Cobrado", align: "right", cell: (w) => <Money value={w.stats.collected} tone="cobrado" /> },
  { key: "costo", header: "Costo", align: "right", cell: (w) => <Money value={w.stats.cost} /> },
  {
    key: "gan",
    header: "Ganancia",
    align: "right",
    cell: (w) => <Money value={w.stats.profit} tone="auto" className="font-semibold" />,
  },
  { key: "mar", header: "Margen", align: "right", cell: (w) => `${w.stats.margin.toFixed(0)} %` },
  { key: "lb", header: "Por lb", align: "right", cell: (w) => perLbText(w.stats.profit, w.stats.kgPaid) },
];

// Una fila por semana (la más reciente arriba) y el total del período mostrado.
export function WeeklyLedgerTable({ weeks }: { weeks: WeekPoint[] }) {
  const total = sumWeeks(weeks);
  const totalKg = weeks.reduce((s, w) => s + w.kgSold, 0);

  return (
    <DataTable
      caption="Libro semanal de ganancias"
      columns={COLUMNS}
      rows={weeks.slice().reverse()}
      rowKey={(w) => w.start.toISOString()}
      mobileCard={(w) => (
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="num font-semibold text-tinta">{w.label}</p>
            <p className="num text-[0.8125rem] text-tinta-2">
              {formatKg(w.kgSold)} kg · {plural(w.orderCount, "pedido")}
            </p>
            <p className="num text-xs text-tinta-3">
              Vendido {formatCOP(w.stats.revenue)} · cobrado {formatCOP(w.stats.collected)} · costo{" "}
              {formatCOP(w.stats.cost)}
            </p>
          </div>
          <div className="text-right">
            <Money value={w.stats.profit} tone="auto" className="text-base font-semibold" />
            <p className="num text-xs text-tinta-3">
              {w.stats.margin.toFixed(0)} % · {perLbText(w.stats.profit, w.stats.kgPaid)}/lb
            </p>
          </div>
        </div>
      )}
      footer={
        <tr className="border-t-2 border-linea-fuerte bg-hoja-2 font-semibold">
          <td className="px-3 py-2.5 text-tinta-2">Total ({weeks.length} sem.)</td>
          <td className="num px-3 py-2.5 text-right">{formatKg(totalKg)}</td>
          <td className="px-3 py-2.5 text-right">
            <Money value={total.revenue} />
          </td>
          <td className="px-3 py-2.5 text-right">
            <Money value={total.collected} tone="cobrado" />
          </td>
          <td className="px-3 py-2.5 text-right">
            <Money value={total.cost} />
          </td>
          <td className="total-doble px-3 py-2.5 text-right">
            <Money value={total.profit} tone="auto" />
          </td>
          <td className="num px-3 py-2.5 text-right">{total.margin.toFixed(0)} %</td>
          <td className="num px-3 py-2.5 text-right">{perLbText(total.profit, total.kgPaid)}</td>
        </tr>
      }
    />
  );
}
