import { ScopedLink } from "@/features/shell/components/ScopedLink";
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
  <ScopedLink href={`/admin/clientes/${r.id}`} className="font-semibold text-tinta hover:underline">
    {r.name}
  </ScopedLink>
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
  scoped = false,
}: {
  rows: ClientRow[];
  totalPorCobrar: number;
  searching: boolean;
  // Se ve una semana pasada: la lista vacía significa "nadie compró esa semana".
  scoped?: boolean;
}) {
  const total = <Money value={totalPorCobrar} tone={totalPorCobrar > 0 ? "debe" : "neutral"} />;

  return (
    <>
      <DataTable
        caption="Clientes"
        columns={COLUMNS}
        rows={rows}
        rowKey={(r) => r.id}
        mobileLayout="cards"
        empty={
          <EmptyState
            title={searching ? "Ningún cliente coincide" : scoped ? "Nadie compró esa semana" : "Aún no hay clientes"}
            description={
              searching
                ? "Prueba con otro nombre o teléfono."
                : scoped
                  ? "No hay pedidos en esa semana."
                  : "Los clientes se crean solos cuando hacen su primer pedido."
            }
          />
        }
        mobileCard={(r) => (
          <ScopedLink href={`/admin/clientes/${r.id}`} className="flex items-center justify-between gap-3 py-1">
            <div className="flex min-w-0 flex-col gap-0.5">
              <p className="truncate text-sm/5 font-semibold text-tinta">{r.name}</p>
              <p className="num text-[0.8125rem]/[1.125rem] text-tinta-2">
                {plural(r.orders, "pedido")}
                {r.phone ? ` · ${r.phone}` : ""}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1 text-sm">
              <Balance row={r} />
              {r.daysInDebt !== null && r.daysInDebt >= 7 && <Age row={r} />}
            </div>
          </ScopedLink>
        )}
        footer={
          <tr className="border-t border-linea bg-hoja-2 font-medium">
            <td colSpan={4} className="px-4 py-3 text-left text-tinta-2">
              Total por cobrar
            </td>
            <td className="num px-2 py-3 text-right font-semibold">{total}</td>
            <td />
          </tr>
        }
      />
      {rows.length > 0 && (
        <div className="mt-3 flex items-center justify-between rounded-lg border border-linea bg-hoja-2 p-4 lg:hidden">
          <p className="text-sm/5 text-tinta-2">Total por cobrar</p>
          <p className="num text-base/6 font-semibold">{total}</p>
        </div>
      )}
    </>
  );
}
