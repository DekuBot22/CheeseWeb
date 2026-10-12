import Link from "next/link";
import type { Debtor } from "@/domain/receivables";
import { Card, CardBody, CardHeader } from "@/ui/Card";
import { EmptyState } from "@/ui/EmptyState";
import { HBarList } from "@/ui/HBarList";
import { Money } from "@/ui/Money";

const TOP_DEBTORS = 5;

// Quién me debe: los 5 mayores deudores (la antigüedad de la deuda está en Gráficas).
export function DebtorsCard({ debtors }: { debtors: Debtor[] }) {
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
          <HBarList
            items={debtors.slice(0, TOP_DEBTORS).map((d) => ({
              label: d.name,
              value: d.owed,
              valueLabel: <Money value={d.owed} tone="debe" />,
              sub: d.days >= 7 ? `hace ${d.days} días` : undefined,
              href: d.clientId ? `/admin/clientes/${d.clientId}` : undefined,
            }))}
          />
        )}
      </CardBody>
    </Card>
  );
}
