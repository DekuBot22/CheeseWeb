import Link from "next/link";
import type { Debtor } from "@/domain/receivables";
import type { Order } from "@/domain/order";
import { formatCOP, plural } from "@/lib/format";
import { Card, CardBody, CardHeader } from "@/ui/Card";
import type { DotTone } from "@/ui/Dot";
import { DotItem } from "@/ui/DotItem";

// Pedidos que listPendingOrders trae como máximo: si llegan al tope, hay "más de" esos.
export const PENDING_FETCHED = 6;

// "A, B y 2 más" con los primeros nombres.
function names(list: string[], shown: number): string {
  const head = list.slice(0, shown).join(" · ");
  const rest = list.length - shown;
  return rest > 0 ? `${head} y ${rest} más` : head;
}

interface Item {
  tone: DotTone;
  title: string;
  detail?: string;
}

// Por revisar: lo que pide atención hoy, calculado con lo que el Inicio ya tiene a mano.
export function ReviewCard({
  pending,
  debtors,
  providerBalance,
}: {
  pending: Order[];
  debtors: Debtor[];
  providerBalance: number;
}) {
  const aging = debtors.filter((d) => d.days >= 8 && d.days < 15);
  const overdue = debtors.filter((d) => d.days >= 15);

  const items: Item[] = [];
  if (pending.length > 0) {
    items.push({
      tone: "info",
      title:
        pending.length >= PENDING_FETCHED
          ? `Más de ${plural(PENDING_FETCHED - 1, "pedido")} por entregar`
          : `${plural(pending.length, "pedido")} por entregar`,
      detail: names(
        pending.map((o) => o.client_name),
        2
      ),
    });
  }
  if (aging.length > 0) {
    items.push({
      tone: "aviso",
      title: `${plural(aging.length, "deudor")} de 8 a 14 días`,
      detail: names(
        aging.map((d) => d.name),
        3
      ),
    });
  }
  if (overdue.length > 0) {
    items.push({
      tone: "debe",
      title: `${plural(overdue.length, "deudor")} de 15 días o más`,
      detail: names(
        overdue.map((d) => d.name),
        3
      ),
    });
  }
  if (providerBalance > 0) {
    items.push({
      tone: "neutro",
      title: "Saldo con el proveedor",
      detail: `Le debes ${formatCOP(providerBalance)}`,
    });
  }

  return (
    <Card>
      <CardHeader title="Por revisar" />
      <CardBody className="pt-1 md:pt-1">
        {items.length === 0 ? (
          <p className="py-3 text-[0.8125rem]/[1.125rem] text-tinta-2">Todo al día: nada pendiente por revisar.</p>
        ) : (
          <ul>
            {items.map((i) => (
              <DotItem key={i.title} tone={i.tone} title={i.title}>
                {i.detail}
              </DotItem>
            ))}
          </ul>
        )}
        <Link
          href="/admin/pedidos?estado=pendiente"
          className="mt-3 inline-block text-[0.8125rem]/[1.125rem] font-semibold text-acento hover:underline"
        >
          Ver pedidos pendientes →
        </Link>
      </CardBody>
    </Card>
  );
}
