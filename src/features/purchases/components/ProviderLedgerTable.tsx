import type { LedgerRow } from "@/domain/provider-ledger";
import { formatCOP, formatDayShort, plural } from "@/lib/format";
import { Badge } from "@/ui/Badge";
import { DataTable, type Column } from "@/ui/DataTable";
import { EmptyState } from "@/ui/EmptyState";
import { cx } from "@/lib/cx";
import { Money } from "@/ui/Money";
import { VoidMovementButton } from "./VoidMovementButton";

const dash = <span className="text-tinta-3">—</span>;

const KINDS: Record<LedgerRow["kind"], { tone: "neutral" | "pagado" | "aviso"; label: string }> = {
  compra: { tone: "neutral", label: "Compra" },
  pago: { tone: "pagado", label: "Pago" },
  descuento: { tone: "aviso", label: "Descuento" },
};

function KindBadge({ kind }: { kind: LedgerRow["kind"] }) {
  return <Badge tone={KINDS[kind].tone}>{KINDS[kind].label}</Badge>;
}

// Monto con signo para la tarjeta móvil: compra "+", pago y descuento "−".
function SignedAmount({ row }: { row: LedgerRow }) {
  const isPurchase = row.kind === "compra";
  const value = isPurchase ? row.compra : row.kind === "pago" ? row.pago : row.descuento;
  return (
    <span
      className={cx(
        "num text-sm/5 font-semibold",
        row.voided ? "text-tinta-3 line-through" : isPurchase ? "text-tinta" : "text-cobrado"
      )}
    >
      {isPurchase ? "+" : "−"} {formatCOP(value)}
    </span>
  );
}

// Lo anulado se ve tachado y apagado; no mueve el saldo.
function Amount({ row, value, tone }: { row: LedgerRow; value: number; tone?: "cobrado" }) {
  if (!value) return dash;
  return row.voided ? (
    <span className="text-tinta-3 line-through">
      <Money value={value} />
    </span>
  ) : (
    <Money value={value} tone={tone} />
  );
}

function movementLabel(r: LedgerRow): string {
  return `${KINDS[r.kind].label.toLowerCase()} del ${formatDayShort(r.date)}`;
}

function VoidInfo({ row }: { row: LedgerRow }) {
  if (!row.voided) return null;
  return (
    <span className="mt-0.5 block text-xs/4 text-tinta-3">
      Anulado{row.voidReason ? `: ${row.voidReason}` : ""}
    </span>
  );
}

const COLUMNS: Column<LedgerRow>[] = [
  {
    key: "fecha",
    header: "Fecha",
    cell: (r) => <span className="num whitespace-nowrap text-[0.8125rem]/[1.125rem] text-tinta-2">{formatDayShort(r.date)}</span>,
  },
  {
    key: "concepto",
    header: "Concepto",
    cell: (r) => (
      <div>
        <span className={cx("flex items-center gap-2", r.voided && "opacity-60")}>
          <KindBadge kind={r.kind} />
          <span className="text-[0.8125rem]/[1.125rem] text-tinta-2">{r.detail || "—"}</span>
        </span>
        <VoidInfo row={r} />
      </div>
    ),
  },
  { key: "compra", header: "Compra (+)", align: "right", cell: (r) => <Amount row={r} value={r.compra} /> },
  { key: "pago", header: "Pago (−)", align: "right", cell: (r) => <Amount row={r} value={r.pago} tone="cobrado" /> },
  {
    key: "descuento",
    header: "Descuento (−)",
    align: "right",
    cell: (r) => <Amount row={r} value={r.descuento} tone="cobrado" />,
  },
  { key: "saldo", header: "Saldo", align: "right", cell: (r) => <Money value={r.saldo} className="font-semibold" /> },
  {
    key: "acc",
    header: "",
    align: "right",
    cell: (r) => (r.voided ? null : <VoidMovementButton kind={r.kind} id={r.id} label={movementLabel(r)} />),
  },
];

interface Totals {
  comprado: number;
  pagado: number;
  descontado: number;
  saldo: number;
}

function LedgerFooter({ totals }: { totals: Totals }) {
  const cell = "px-2 py-3 text-right";
  return (
    <tr className="border-t border-linea bg-hoja-2 font-semibold">
      <td colSpan={2} className="px-4 py-3 text-left font-medium text-tinta-2">
        Totales
      </td>
      <td className={cell}>
        <Money value={totals.comprado} />
      </td>
      <td className={cell}>
        <Money value={totals.pagado} tone="cobrado" />
      </td>
      <td className={cell}>
        <Money value={totals.descontado} tone="cobrado" />
      </td>
      <td className={cell}>
        <Money value={totals.saldo} className={totals.saldo > 0 ? "text-acento" : ""} />
      </td>
      <td />
    </tr>
  );
}

// Resumen del libro en móvil: lo mismo que la fila de totales de la tabla.
function MobileTotals({ totals }: { totals: Totals }) {
  const rows: [string, React.ReactNode][] = [
    ["Comprado", <Money key="c" value={totals.comprado} />],
    ["Pagado", <Money key="p" value={totals.pagado} tone="cobrado" />],
    ["Descontado", <Money key="d" value={totals.descontado} tone="cobrado" />],
    ["Saldo", <Money key="s" value={totals.saldo} className={totals.saldo > 0 ? "text-acento" : ""} />],
  ];
  return (
    <dl className="mt-3 flex flex-col gap-1.5 rounded-lg border border-linea bg-hoja-2 p-4 text-sm/5 lg:hidden">
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-center justify-between">
          <dt className="text-tinta-2">{label}</dt>
          <dd className="num font-semibold">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ProviderLedgerTable({ rows, totals, purchaseCount }: { rows: LedgerRow[]; totals: Totals; purchaseCount: number }) {
  return (
    <>
      <DataTable
        caption="Libro del proveedor"
        columns={COLUMNS}
        rows={rows}
        rowKey={(r) => r.key}
        mobileLayout="cards"
        empty={
          <EmptyState
            title="Aún no hay movimientos"
            description="Registra la primera compra para llevar la cuenta con tu proveedor."
          />
        }
        mobileCard={(r) => (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <p className={cx("flex items-center gap-2", r.voided && "opacity-60")}>
                <KindBadge kind={r.kind} />
                <span className="num text-[0.8125rem]/[1.125rem] text-tinta-2">{formatDayShort(r.date)}</span>
              </p>
              <SignedAmount row={r} />
            </div>
            {(r.detail || r.voided) && (
              <div className="text-[0.8125rem]/[1.125rem] text-tinta-2">
                {r.detail}
                <VoidInfo row={r} />
              </div>
            )}
            <div className="flex items-center justify-between gap-3">
              <p className="num text-xs/4 text-tinta-3">
                Saldo <Money value={r.saldo} className="text-sm/5 font-semibold text-tinta" />
              </p>
              {!r.voided && <VoidMovementButton kind={r.kind} id={r.id} label={movementLabel(r)} />}
            </div>
          </div>
        )}
        footer={<LedgerFooter totals={totals} />}
      />
      {rows.length > 0 && <MobileTotals totals={totals} />}
      <p className="mt-2 text-xs/4 text-tinta-3">
        {plural(purchaseCount, "compra")} en total · saldo = comprado − descuentos − pagado.
      </p>
    </>
  );
}
