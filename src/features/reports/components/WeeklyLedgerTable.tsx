import { sumWeeks, type WeekPoint } from "@/domain/accounting";
import { profitPerLb } from "@/domain/pricing";
import { formatCOP, formatKg, formatWeekLabel, plural, weekTitle } from "@/lib/format";
import { DataTable, type Column } from "@/ui/DataTable";
import { Money } from "@/ui/Money";

// Ganancia por libra de una semana; "—" si no se vendió nada.
const perLbText = (profit: number, kg: number) => {
  const v = profitPerLb(profit, kg);
  return v === null ? "—" : formatCOP(Math.round(v));
};

const muted = (value: string) => <span className="text-tinta-2">{value}</span>;

const COLUMNS: Column<WeekPoint>[] = [
  {
    key: "semana",
    header: "Semana",
    cell: (w) => (
      <span className="num whitespace-nowrap text-sm/5 font-medium text-tinta">
        {w.label}
        <span> – {formatWeekLabel(w.start, w.end).split(" – ")[1].split(",")[0]}</span>
        {w.days !== 7 && <span className="font-normal text-aviso"> · {plural(w.days, "día")}</span>}
      </span>
    ),
  },
  { key: "kg", header: "Kg", align: "right", cell: (w) => muted(formatKg(w.kgSold)) },
  { key: "ing", header: "Vendido", align: "right", cell: (w) => <Money value={w.stats.revenue} /> },
  { key: "cob", header: "Cobrado", align: "right", cell: (w) => <Money value={w.stats.collected} tone="cobrado" /> },
  { key: "costo", header: "Costo", align: "right", cell: (w) => <Money value={w.stats.cost} /> },
  {
    key: "gan",
    header: "Ganancia",
    align: "right",
    cell: (w) => <Money value={w.stats.profit} tone={w.stats.profit < 0 ? "debe" : "cobrado"} className="font-semibold" />,
  },
  { key: "mar", header: "Margen", align: "right", cell: (w) => muted(`${w.stats.margin.toFixed(0)} %`) },
  { key: "lb", header: "Por lb", align: "right", cell: (w) => muted(perLbText(w.stats.profit, w.stats.kgPaid)) },
];

// Una cifra de la tarjeta móvil: rótulo chico arriba, valor abajo.
function Figure({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="text-[0.6875rem]/[0.875rem] font-medium text-tinta-3">{label}</dt>
      <dd className="num text-sm/5 font-semibold">{children}</dd>
    </div>
  );
}

function WeekCard({ w }: { w: WeekPoint }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <p className="num text-[0.9375rem]/[1.375rem] font-semibold text-tinta">{weekTitle(w.label, w.days)}</p>
        <div className="flex flex-col items-end">
          <Money
            value={w.stats.profit}
            tone={w.stats.profit < 0 ? "debe" : "cobrado"}
            className="text-[0.9375rem]/[1.375rem] font-semibold"
          />
          <span className="text-[0.6875rem]/[0.875rem] font-medium text-tinta-3">Ganancia</span>
        </div>
      </div>
      <dl className="grid grid-cols-3 gap-3">
        <Figure label="Vendido">
          <Money value={w.stats.revenue} />
        </Figure>
        <Figure label="Cobrado">
          <Money value={w.stats.collected} tone="cobrado" />
        </Figure>
        <Figure label="Costo">
          <Money value={w.stats.cost} />
        </Figure>
      </dl>
      <p className="num text-[0.6875rem]/[0.875rem] font-medium text-tinta-3">
        {formatKg(w.kgSold)} kg · margen {w.stats.margin.toFixed(0)} % · {perLbText(w.stats.profit, w.stats.kgPaid)} por lb
      </p>
    </div>
  );
}

// Una fila por semana (la más reciente arriba) y el total del período mostrado.
export function WeeklyLedgerTable({ weeks }: { weeks: WeekPoint[] }) {
  const total = sumWeeks(weeks);
  const totalKg = weeks.reduce((s, w) => s + w.kgSold, 0);
  const cell = "px-2 py-3 text-right";

  return (
    <DataTable
      caption="Libro semanal de ganancias"
      columns={COLUMNS}
      rows={weeks.slice().reverse()}
      rowKey={(w) => w.start.toISOString()}
      mobileLayout="cards"
      mobileCard={(w) => <WeekCard w={w} />}
      footer={
        <tr className="border-t border-linea bg-hoja-2 font-semibold">
          <td className="px-4 py-3 font-medium text-tinta-2">Total ({weeks.length} sem.)</td>
          <td className={`num ${cell} text-tinta-2`}>{formatKg(totalKg)}</td>
          <td className={cell}>
            <Money value={total.revenue} />
          </td>
          <td className={cell}>
            <Money value={total.collected} tone="cobrado" />
          </td>
          <td className={cell}>
            <Money value={total.cost} />
          </td>
          <td className={cell}>
            <Money value={total.profit} tone={total.profit < 0 ? "debe" : "cobrado"} />
          </td>
          <td className={`num ${cell} text-tinta-2`}>{total.margin.toFixed(0)} %</td>
          <td className={`num ${cell} pr-4 text-tinta-2`}>{perLbText(total.profit, total.kgPaid)}</td>
        </tr>
      }
    />
  );
}
