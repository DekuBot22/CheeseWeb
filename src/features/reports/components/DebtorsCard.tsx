import Link from "next/link";
import type { Debtor } from "@/domain/receivables";
import { Card, CardBody, CardHeader } from "@/ui/Card";
import { EmptyState } from "@/ui/EmptyState";
import { HBarList } from "@/ui/HBarList";
import { Money } from "@/ui/Money";

// Rampa secuencial de antigüedad (tokens del tema): la deuda más vieja es la más viva.
const AGING_COLORS = ["var(--aging-1)", "var(--aging-2)", "var(--aging-3)", "var(--aging-4)"];
const TOP_DEBTORS = 5;

// Quién me debe: los 5 mayores deudores y la deuda repartida por antigüedad.
export function DebtorsCard({
  debtors,
  aging,
}: {
  debtors: Debtor[];
  aging: { label: string; amount: number }[];
}) {
  return (
    <Card>
      <CardHeader
        title="Quién me debe"
        subtitle={debtors.length ? `Los ${TOP_DEBTORS} con mayor deuda` : undefined}
        action={
          <Link href="/admin/clientes" className="text-sm font-medium text-acento hover:underline">
            Ver todos →
          </Link>
        }
      />
      <CardBody>
        {debtors.length === 0 ? (
          <EmptyState title="Nadie te debe nada" description="Todos los pedidos están pagados. Bien." />
        ) : (
          <div className="space-y-6">
            <HBarList
              items={debtors.slice(0, TOP_DEBTORS).map((d) => ({
                label: d.name,
                value: d.owed,
                valueLabel: <Money value={d.owed} tone="debe" />,
                sub: d.days >= 7 ? `hace ${d.days} días` : undefined,
                href: d.clientId ? `/admin/clientes/${d.clientId}` : undefined,
              }))}
            />
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.06em] text-tinta-3">
                Antigüedad de la deuda
              </p>
              <HBarList
                items={aging.map((a, i) => ({
                  label: a.label,
                  value: a.amount,
                  valueLabel: <Money value={a.amount} />,
                  color: AGING_COLORS[i],
                }))}
              />
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
