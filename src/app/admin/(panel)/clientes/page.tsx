import { supabaseAdmin } from "@/lib/supabase";
import ClientsList, { type ClientRow } from "@/components/admin/ClientsList";
import type { Client, Order } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const [{ data: clients }, { data: orders }] = await Promise.all([
    supabaseAdmin.from("clients").select("*").order("name", { ascending: true }),
    supabaseAdmin
      .from("orders")
      .select("client_id, total, amount_paid, payment_status"),
  ]);

  const debeByClient = new Map<string, number>();
  const countByClient = new Map<string, number>();
  for (const order of (orders as Pick<Order, "client_id" | "total" | "amount_paid" | "payment_status">[]) ?? []) {
    if (!order.client_id) continue;
    countByClient.set(order.client_id, (countByClient.get(order.client_id) ?? 0) + 1);
    if (order.payment_status !== "pagado") {
      const remaining = Math.max(order.total - order.amount_paid, 0);
      debeByClient.set(order.client_id, (debeByClient.get(order.client_id) ?? 0) + remaining);
    }
  }

  const rows: ClientRow[] = ((clients as Client[]) ?? []).map((client) => ({
    id: client.id,
    name: client.name,
    phone: client.phone,
    credit_balance: Number(client.credit_balance),
    total_debe: debeByClient.get(client.id) ?? 0,
    orders_count: countByClient.get(client.id) ?? 0,
  }));

  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold text-zinc-900">Clientes ({rows.length})</h2>
      <ClientsList clients={rows} />
    </div>
  );
}
