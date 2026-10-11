import Link from "next/link";
import { notFound } from "next/navigation";
import { remainingOf } from "@/domain/order";
import { plural } from "@/lib/format";
import { ClientEditor } from "@/features/clients/components/ClientEditor";
import { ClientSummary } from "@/features/clients/components/ClientSummary";
import { getClient } from "@/features/clients/server/clients.repo";
import { OrdersTable } from "@/features/orders/components/OrdersTable";
import { listOrdersByClient } from "@/features/orders/server/orders.repo";
import { PageHeader } from "@/ui/PageHeader";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [client, orders] = await Promise.all([getClient(id), listOrdersByClient(id)]);
  if (!client) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/clientes" className="mb-2 inline-block text-sm font-medium text-acento hover:underline">
          ← Clientes
        </Link>
        <PageHeader title={client.name} subtitle={plural(orders.length, "pedido")} />
      </div>

      <ClientSummary
        debe={orders.reduce((s, o) => s + remainingOf(o), 0)}
        credit={Number(client.credit_balance)}
        comprado={orders.reduce((s, o) => s + Number(o.total), 0)}
      />

      <ClientEditor client={client} />

      <section aria-labelledby="historial">
        <h2 id="historial" className="mb-3 font-display text-lg font-semibold text-tinta">
          Historial de pedidos
        </h2>
        <OrdersTable initialOrders={orders} showClient={false} emptyTitle="Este cliente aún no tiene pedidos" />
      </section>
    </div>
  );
}
