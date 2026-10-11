import type { LedgerRow } from "@/domain/provider-ledger";
import { formatDay } from "@/lib/format";
import { Badge } from "@/ui/Badge";
import { DataTable, type Column } from "@/ui/DataTable";
import { EmptyState } from "@/ui/EmptyState";
import { Money } from "@/ui/Money";

const dash = <span className="text-tinta-3">—</span>;

function KindBadge({ kind }: { kind: LedgerRow["kind"] }) {
  return <Badge tone={kind === "compra" ? "neutral" : "pagado"}>{kind === "compra" ? "Compra" : "Pago"}</Badge>;
}

const COLUMNS: Column<LedgerRow>[] = [
  { key: "fecha", header: "Fecha", cell: (r) => <span className="num">{formatDay(r.date)}</span> },
  {
    key: "concepto",
    header: "Concepto",
    cell: (r) => (
      <span className="flex items-center gap-2">
        <KindBadge kind={r.kind} />
        <span className="text-tinta-2">{r.detail || "—"}</span>
      </span>
    ),
  },
  { key: "compra", header: "Compra (+)", align: "right", cell: (r) => (r.compra ? <Money value={r.compra} /> : dash) },
  { key: "pago", header: "Pago (−)", align: "right", cell: (r) => (r.pago ? <Money value={r.pago} tone="cobrado" /> : dash) },
  { key: "saldo", header: "Saldo", align: "right", cell: (r) => <Money value={r.saldo} className="font-semibold" /> },
];

export function ProviderLedgerTable({
  rows,
  totals,
}: {
  rows: LedgerRow[];
  totals: { comprado: number; pagado: number; saldo: number };
}) {
  const saldoClass = totals.saldo > 0 ? "text-acento" : "";

  return (
    <DataTable
      caption="Libro del proveedor"
      columns={COLUMNS}
      rows={rows}
      rowKey={(r) => r.key}
      empty={
        <EmptyState
          title="Aún no hay movimientos"
          description="Registra la primera compra y el costo de tus ganancias pasará de estimado a real."
        />
      }
      mobileCard={(r) => (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-2">
              <KindBadge kind={r.kind} />
              <span className="num text-sm text-tinta-2">{formatDay(r.date)}</span>
            </p>
            {r.detail && <p className="mt-1 truncate text-[0.8125rem] text-tinta-2">{r.detail}</p>}
          </div>
          <div className="text-right">
            <Money
              value={r.kind === "compra" ? r.compra : -r.pago}
              tone={r.kind === "pago" ? "cobrado" : "neutral"}
              className="text-sm font-semibold"
            />
            <p className="num text-xs text-tinta-3">
              Saldo <Money value={r.saldo} />
            </p>
          </div>
        </div>
      )}
      footer={
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
          <td className="total-doble px-3 py-2.5 text-right">
            <Money value={totals.saldo} className={saldoClass} />
          </td>
        </tr>
      }
    />
  );
}
