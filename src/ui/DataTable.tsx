import type { ReactNode } from "react";
import Link from "next/link";
import { cx } from "@/lib/cx";

export interface Column<T> {
  key: string;
  header: string;
  align?: "right";
  cell: (row: T) => ReactNode;
  // Si se pasa, el encabezado es un enlace que ordena (la página ordena en servidor).
  sortHref?: string;
  sortDir?: "asc" | "desc" | null;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  rowClassName?: (row: T) => string | undefined;
  footer?: ReactNode;
  caption: string;
  // true cuando por debajo de lg se muestra la lista de `mobileCard` en su lugar.
  hiddenBelowLg: boolean;
}

function Table<T>({ columns, rows, rowKey, rowClassName, footer, caption, hiddenBelowLg }: TableProps<T>) {
  return (
    <div className={cx("overflow-x-auto", hiddenBelowLg && "hidden lg:block")}>
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                aria-sort={c.sortDir === "asc" ? "ascending" : c.sortDir === "desc" ? "descending" : undefined}
                className={cx(
                  "h-9 border-b border-linea px-2 text-xs/4 font-medium text-tinta-3 first:pl-4 last:pr-4",
                  c.align === "right" ? "text-right" : "text-left"
                )}
              >
                {c.sortHref ? (
                  <Link href={c.sortHref} className="hover:text-tinta">
                    {c.header}
                    {c.sortDir && <span aria-hidden="true">{c.sortDir === "asc" ? " ▲" : " ▼"}</span>}
                  </Link>
                ) : (
                  c.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              className={cx("border-b border-linea-suave last:border-b-0 hover:bg-hoja-2", rowClassName?.(row))}
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={cx("px-2 py-2.5 align-middle first:pl-4 last:pr-4", c.align === "right" && "num text-right", c.className)}
                >
                  {c.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {footer && <tfoot>{footer}</tfoot>}
      </table>
    </div>
  );
}

// Tabla densa desde lg (1024 px) y, por debajo, una lista hecha con `mobileCard`: con el menú
// lateral desde md el contenido en tablet es angosto. `mobileLayout` elige cómo se ve esa lista:
// "list" son filas separadas por líneas dentro de un solo recuadro; "cards" son tarjetas sueltas.
// Es presentacional (sin estado), así que sirve en páginas de servidor y en componentes cliente.
export function DataTable<T>({
  mobileCard,
  mobileLayout = "list",
  empty,
  ...table
}: Omit<TableProps<T>, "hiddenBelowLg"> & {
  mobileCard?: (row: T) => ReactNode;
  mobileLayout?: "list" | "cards";
  empty?: ReactNode;
}) {
  const { rows, rowKey, rowClassName } = table;
  if (rows.length === 0 && empty) return <>{empty}</>;

  const desktop = <Table {...table} hiddenBelowLg={Boolean(mobileCard)} />;

  if (mobileCard && mobileLayout === "cards") {
    return (
      <>
        <ul className="flex flex-col gap-3 lg:hidden">
          {rows.map((row) => (
            <li key={rowKey(row)} className={cx("rounded-lg border border-linea bg-hoja p-4", rowClassName?.(row))}>
              {mobileCard(row)}
            </li>
          ))}
        </ul>
        <div className="hidden overflow-hidden rounded-md border border-linea bg-hoja lg:block">{desktop}</div>
      </>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-linea bg-hoja">
      {mobileCard && (
        <ul className="divide-y divide-linea-suave lg:hidden">
          {rows.map((row) => (
            <li key={rowKey(row)} className={cx("p-4", rowClassName?.(row))}>
              {mobileCard(row)}
            </li>
          ))}
        </ul>
      )}
      {desktop}
    </div>
  );
}
