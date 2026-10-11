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

// Tabla densa en pantallas md+ y lista de tarjetas en móvil. Es presentacional
// (sin estado), así que sirve tanto en páginas de servidor como en componentes cliente.
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  mobileCard,
  footer,
  empty,
  caption,
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  mobileCard?: (row: T) => ReactNode;
  footer?: ReactNode;
  empty?: ReactNode;
  caption: string;
}) {
  if (rows.length === 0 && empty) return <>{empty}</>;

  return (
    <div className="overflow-hidden rounded-lg border border-linea bg-hoja shadow-hoja">
      {mobileCard && (
        <ul className="divide-y divide-linea md:hidden">
          {rows.map((row) => (
            <li key={rowKey(row)} className="p-4">
              {mobileCard(row)}
            </li>
          ))}
        </ul>
      )}

      <div className={cx("overflow-x-auto", mobileCard && "hidden md:block")}>
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="bg-hoja-2">
              {columns.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  aria-sort={
                    c.sortDir === "asc" ? "ascending" : c.sortDir === "desc" ? "descending" : undefined
                  }
                  className={cx(
                    "border-b border-linea px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.06em] text-tinta-3",
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
              <tr key={rowKey(row)} className="border-b border-linea last:border-b-0 hover:bg-hoja-3">
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={cx(
                      "px-3 py-2.5 align-middle",
                      c.align === "right" && "num text-right",
                      c.className
                    )}
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
    </div>
  );
}
