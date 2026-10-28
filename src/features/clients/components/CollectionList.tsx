import { whatsappLink, whatsappNumber } from "@/domain/collection-message";
import type { CollectionRow } from "@/domain/monthly-collection";
import { formatDayShort, plural } from "@/lib/format";
import { buttonClasses } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { EmptyState } from "@/ui/EmptyState";
import { Money } from "@/ui/Money";
import { ScopedLink } from "@/features/shell/components/ScopedLink";

function ClientName({ row }: { row: CollectionRow }) {
  const className = "text-sm/5 font-semibold text-tinta";
  return row.clientId ? (
    <ScopedLink href={`/admin/clientes/${row.clientId}`} className={`${className} hover:underline`}>
      {row.name}
    </ScopedLink>
  ) : (
    <span className={className}>{row.name}</span>
  );
}

function CollectionItem({ row, month }: { row: CollectionRow; month: string }) {
  const hasNumber = whatsappNumber(row.phone) !== null;
  return (
    <li className="flex flex-col gap-3 border-b border-linea-suave px-4 py-3.5 last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <ClientName row={row} />
          <p className="text-[0.8125rem]/[1.125rem] text-tinta-3">
            {plural(row.orders, "pedido")}
            {row.phone ? ` · ${row.phone}` : ""}
          </p>
        </div>
        <Money value={row.owed} tone="debe" className="text-base/6 font-semibold" />
      </div>

      {row.weeks.length > 1 && (
        <ul className="flex flex-col gap-1 text-[0.8125rem]/[1.125rem] text-tinta-2">
          {row.weeks.map((w) => (
            <li key={w.from} className="flex justify-between gap-3">
              <span className="num">
                {formatDayShort(w.from)} – {formatDayShort(w.to)} · {plural(w.orders, "pedido")}
              </span>
              <Money value={w.owed} />
            </li>
          ))}
        </ul>
      )}
      {row.earlierOwed > 0 && (
        <p className="text-[0.8125rem]/[1.125rem] text-aviso">
          Además debe <Money value={row.earlierOwed} /> de meses anteriores (no está en este total).
        </p>
      )}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <a href={whatsappLink(row, month)} target="_blank" rel="noopener noreferrer" className={buttonClasses("secondary", "sm")}>
          Cobrar por WhatsApp
        </a>
        {!hasNumber && <span className="text-xs text-tinta-3">Sin teléfono guardado: eliges el chat en WhatsApp.</span>}
      </div>
    </li>
  );
}

// Cobro del mes: un bloque por cliente con lo que debe del mes, su desglose por semana y el botón de WhatsApp.
export function CollectionList({ rows, month }: { rows: CollectionRow[]; month: string }) {
  if (rows.length === 0) {
    return (
      <Card>
        <EmptyState title="Nadie te debe de este mes" description="Todos los pedidos de este mes están pagados. Bien." />
      </Card>
    );
  }
  return (
    <Card>
      <ul>
        {rows.map((row) => (
          <CollectionItem key={row.clientId ?? row.name} row={row} month={month} />
        ))}
      </ul>
    </Card>
  );
}
