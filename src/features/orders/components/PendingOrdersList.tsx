import Link from "next/link";
import type { Order } from "@/domain/order";
import { formatDateShort } from "@/lib/format";
import { Card, CardBody, CardHeader } from "@/ui/Card";
import { EmptyState } from "@/ui/EmptyState";
import { Money } from "@/ui/Money";
import { PaymentBadge } from "./OrderBadges";

export function PendingOrdersList({ orders }: { orders: Order[] }) {
  return (
    <Card>
      <CardHeader
        title="Pedidos pendientes"
        subtitle="Por preparar o entregar"
        action={
          <Link href="/admin/pedidos?estado=pendiente" className="text-sm font-medium text-acento hover:underline">
            Ver pedidos →
          </Link>
        }
      />
      <CardBody className="p-0 md:p-0">
        {orders.length === 0 ? (
          <div className="p-4 md:p-5">
            <EmptyState title="Todo entregado" description="No hay pedidos pendientes." />
          </div>
        ) : (
          <ul className="divide-y divide-linea">
            {orders.map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-3 px-4 py-3 md:px-5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-tinta">{o.client_name}</p>
                  <p className="num text-[0.8125rem] text-tinta-2">
                    {o.quantity} {o.unit} · {formatDateShort(o.created_at)}
                  </p>
                  {o.note && <p className="truncate text-[0.8125rem] italic text-tinta-2">{o.note}</p>}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <Money value={Number(o.total)} className="text-sm font-semibold" />
                  <PaymentBadge status={o.payment_status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
