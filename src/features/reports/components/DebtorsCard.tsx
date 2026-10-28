import Link from "next/link";
import type { Debtor } from "@/domain/receivables";
import { plural } from "@/lib/format";
import { withWeekParam } from "@/lib/week-param";
import { Badge } from "@/ui/Badge";
import { Card, CardBody, CardHeader } from "@/ui/Card";
import { DataTable, type Column } from "@/ui/DataTable";
import { EmptyState } from "@/ui/EmptyState";
import { Money } from "@/ui/Money";

const TOP_DEBTORS = 6;

// Mismos cortes que "Por revisar": 15 días o más en rojo, de 8 a 14 en ámbar.
export function debtTone(days: number): "debe" | "aviso" | "neutral" {
  return days >= 15 ? "debe" : days >= 8 ? "aviso" : "neutral";
}

function DebtorName({ d }: { d: Debtor }) {
  const className = "text-sm/5 font-medium text-tinta";
  return d.clientId ? (
    <Link href={`/admin/clientes/${d.clientId}`} className={`${className} hover:underline`}>
      {d.name}
    </Link>
  ) : (
    <span className={className}>{d.name}</span>
  );
}

const COLUMNS: Column<Debtor>[] = [
  { key: "name", header: "Cliente", cell: (d) => <DebtorName d={d} /> },
  { key: "owed", header: "Debe", align: "right", cell: (d) => <Money value={d.owed} /> },
  {
    key: "age",
    header: "Antigüedad",
    className: "w-36",
    cell: (d) => <Badge tone={debtTone(d.days)}>{plural(d.days, "día")}</Badge>,
  },
];

// Quién me debe: los mayores deudores con la antigüedad de su deuda más vieja.
// En una semana pasada (`semana`) son solo los pedidos de esa semana y el título lo dice.
export function DebtorsCard({ debtors, total, semana = null }: { debtors: Debtor[]; total: number; semana?: string | null }) {
  const top = debtors.slice(0, TOP_DEBTORS);

  return (
    <Card>
      <CardHeader
        title="Quién me debe"
        subtitle={semana ? "De los pedidos de esa semana · lo que falta cobrar hoy" : undefined}
        action={
          debtors.length > 0 && (
            <p className="num text-right text-[0.8125rem]/[1.125rem] text-tinta-2">
              Me deben <Money value={total} /> · {plural(debtors.length, "cliente")}
            </p>
          )
        }
      />
      <CardBody>
        {debtors.length === 0 ? (
          <EmptyState title="Nadie te debe nada" description="Todos los pedidos están pagados. Bien." />
        ) : (
          <>
            {/* Móvil y tablet: nombre y antigüedad a la izquierda, monto a la derecha. */}
            <ul className="-mt-1 lg:hidden">
              {top.map((d) => (
                <li
                  key={d.clientId ?? d.name}
                  className="flex items-center justify-between gap-3 border-b border-linea-suave py-2.5 last:border-b-0"
                >
                  <div className="flex min-w-0 flex-col items-start gap-1">
                    <DebtorName d={d} />
                    <Badge tone={debtTone(d.days)}>{plural(d.days, "día")}</Badge>
                  </div>
                  <Money value={d.owed} className="text-sm/5 font-semibold text-tinta" />
                </li>
              ))}
            </ul>
            <div className="hidden lg:block">
              <DataTable
                caption="Clientes que deben, de mayor a menor"
                columns={COLUMNS}
                rows={top}
                rowKey={(d) => d.clientId ?? d.name}
              />
            </div>
            {debtors.length > TOP_DEBTORS && (
              <Link
                href={withWeekParam("/admin/clientes", semana)}
                className="mt-3 inline-block text-[0.8125rem]/[1.125rem] font-semibold text-acento hover:underline"
              >
                Ver todos →
              </Link>
            )}
          </>
        )}
      </CardBody>
    </Card>
  );
}
