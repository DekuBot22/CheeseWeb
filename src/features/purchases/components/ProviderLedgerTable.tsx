import type { LedgerRow } from "@/domain/provider-ledger";
import { formatDay, plural } from "@/lib/format";
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

// Monto con signo de la fila para la tarjeta móvil: compra +, pago y descuento −.
function signedAmount(r: LedgerRow) {
  if (r.kind === "compra") return r.compra;
  return -(r.kind === "pago" ? r.pago : r.descuento);
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
  return `${KINDS[r.kind].label.toLowerCase()} del ${formatDay(r.date)}`;
}

function VoidInfo({ row }: { row: LedgerRow }) {
  if (!row.voided) return null;
  return (
    <span className="mt-0.5 block text-xs text-tinta-3">
      Anulado{row.voidReason ? `: ${row.voidReason}` : ""}
    </span>
  );
}

const COLUMNS: Column<LedgerRow>[] = [
  { key: "fecha", header: "Fecha", cell: (r) => <span className="num">{formatDay(r.date)}</span> },
  {
    key: "concepto",
    header: "Concepto",
    cell: (r) => (
      <span>
        <span className={cx("flex items-center gap-2", r.voided && "opacity-60")}>
          <KindBadge kind={r.kind} />
          <span className="text-tinta-2">{r.detail || "—"}</span>
        </span>
        <VoidInfo row={r} />
      </span>
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
  return (
    <tr className="border-t-2 border-linea-fuerte bg-hoja-2 font-semibold">
      <td colSpan={2} className="px-3 py-2.5 text-right text-tinta-2">
        Totales
      </td>
      <td className="px-3 py-2.5 text-right">
        <Money value={totals.comprado} />
      </td>
      <td className="px-3 py-2.5 text-right">
        <Money value={totals.pagado} tone="cobrado" />
      </td>
      <td className="px-3 py-2.5 text-right">
        <Money value={totals.descontado} tone="cobrado" />
      </td>
      <td className="total-doble px-3 py-2.5 text-right">
        <Money value={totals.saldo} className={totals.saldo > 0 ? "text-acento" : ""} />
      </td>
      <td />
    </tr>
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
        empty={
          <EmptyState
            title="Aún no hay movimientos"
            description="Registra la primera compra para llevar la cuenta con tu proveedor."
          />
        }
        mobileCard={(r) => (
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className={cx("flex items-center gap-2", r.voided && "opacity-60")}>
                <KindBadge kind={r.kind} />
                <span className="num text-sm text-tinta-2">{formatDay(r.date)}</span>
              </p>
              {r.detail && <p className="mt-1 text-[0.8125rem] text-tinta-2">{r.detail}</p>}
              <VoidInfo row={r} />
            </div>
            <div className="text-right">
              <span className={cx(r.voided && "text-tinta-3 line-through")}>
                <Money
                  value={signedAmount(r)}
                  tone={r.kind === "compra" || r.voided ? "neutral" : "cobrado"}
                  className="text-sm font-semibold"
                />
              </span>
              <p className="num text-xs text-tinta-3">
                Saldo <Money value={r.saldo} />
              </p>
              {!r.voided && <VoidMovementButton kind={r.kind} id={r.id} label={movementLabel(r)} />}
            </div>
          </div>
        )}
        footer={<LedgerFooter totals={totals} />}
      />
      <p className="mt-2 text-xs text-tinta-3">
        {plural(purchaseCount, "compra")} en total · saldo = comprado − descuentos − pagado.
      </p>
    </>
  );
}
