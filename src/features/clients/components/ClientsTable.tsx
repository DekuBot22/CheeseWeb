import Link from "next/link";
import type { ClientRow } from "@/domain/client-balance";
import { formatDateShort, plural } from "@/lib/format";
import { Badge } from "@/ui/Badge";
import { DataTable, type Column } from "@/ui/DataTable";
import { EmptyState } from "@/ui/EmptyState";
import { Money } from "@/ui/Money";

function Balance({ row }: { row: ClientRow }) {
  if (row.debe > 0) return <Money value={row.debe} tone="debe" className="font-semibold" />;
  if (row.credit > 0) {
    return (
      <span className="text-cobrado">
        A favor <Money value={row.credit} tone="cobrado" />
      </span>
    );
  }
  return <span className="text-tinta-3">Al día</span>;
}

function Age({ row }: { row: ClientRow }) {
  if (row.daysInDebt === null) return <span className="text-tinta-3">—</span>;
  const tone = row.daysInDebt > 14 ? "debe" : row.daysInDebt > 7 ? "aviso" : "neutral";
  return <Badge tone={tone}>{plural(row.daysInDebt, "día")}</Badge>;
}

const nameLink = (r: ClientRow) => (
  <Link href={`/admin/clientes/${r.id}`} className="font-semibold text-tinta hover:underline">
    {r.name}
  </Link>
);

const COLUMNS: Column<ClientRow>[] = [
  { key: "cliente", header: "Cliente", cell: nameLink },
  { key: "tel", header: "Teléfono", cell: (r) => <span className="num text-tinta-2">{r.phone ?? "—"}</span> },
  { key: "pedidos", header: "Pedidos", align: "right", cell: (r) => r.orders },
  {
    key: "ultimo",
    header: "Último pedido",
    cell: (r) => <span className="num text-tinta-2">{r.lastOrderAt ? formatDateShort(r.lastOrderAt) : "—"}</span>,
  },
  { key: "estado", header: "Debe / a favor", align: "right", cell: (r) => <Balance row={r} /> },
  { key: "dias", header: "Antigüedad", cell: (r) => <Age row={r} /> },
];

export function ClientsTable({
  rows,
  totalPorCobrar,
  searching,
}: {
  rows: ClientRow[];
  totalPorCobrar: number;
  searching: boolean;
}) {
  return (
    <DataTable
      caption="Clientes"
      columns={COLUMNS}
      rows={rows}
      rowKey={(r) => r.id}
      empty={
        <EmptyState
          title={searching ? "Ningún cliente coincide" : "Aún no hay clientes"}
          description={
            searching ? "Prueba con otro nombre o teléfono." : "Los clientes se crean solos cuando hacen su primer pedido."
          }
        />
      }
      mobileCard={(r) => (
        <Link href={`/admin/clientes/${r.id}`} className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-semibold text-tinta">{r.name}</p>
            <p className="num text-[0.8125rem] text-tinta-2">
              {plural(r.orders, "pedido")}
              {r.phone ? ` · ${r.phone}` : ""}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1 text-sm">
            <Balance row={r} />
            {r.daysInDebt !== null && r.daysInDebt >= 7 && <Age row={r} />}
          </div>
        </Link>
      )}
      footer={
        <tr className="border-t-2 border-linea-fuerte bg-hoja-2 font-semibold">
          <td colSpan={4} className="px-3 py-2.5 text-right text-tinta-2">
            Total por cobrar
          </td>
          <td className="num total-doble px-3 py-2.5 text-right">
            <Money value={totalPorCobrar} tone={totalPorCobrar > 0 ? "debe" : "neutral"} />
          </td>
          <td />
        </tr>
      }
    />
  );
}
