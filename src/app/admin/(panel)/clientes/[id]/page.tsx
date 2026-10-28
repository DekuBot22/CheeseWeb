import { notFound } from "next/navigation";
import { ScopedLink } from "@/features/shell/components/ScopedLink";
import { summarizeClientOrders } from "@/domain/client-balance";
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
  const summary = summarizeClientOrders(orders);

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <ScopedLink
          href="/admin/clientes"
          className="mb-2 inline-block text-[0.8125rem]/[1.125rem] font-medium text-acento hover:underline"
        >
          ← Clientes
        </ScopedLink>
        <PageHeader title={client.name} subtitle={plural(summary.count, "pedido")} />
      </div>

      <ClientSummary
        debe={summary.debe}
        credit={Number(client.credit_balance)}
        comprado={summary.comprado}
      />

      <ClientEditor client={client} />

      <section aria-labelledby="historial">
        <h2 id="historial" className="mb-3 text-[0.9375rem]/[1.375rem] font-semibold text-tinta">
          Historial de pedidos
        </h2>
        <OrdersTable initialOrders={orders} showClient={false} emptyTitle="Este cliente aún no tiene pedidos" />
      </section>
    </div>
  );
}
