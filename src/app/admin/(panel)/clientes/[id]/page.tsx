import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import ClientEditor from "@/components/admin/ClientEditor";
import OrdersTable from "@/components/admin/OrdersTable";
import type { Client, Order } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [{ data: client }, { data: orders }] = await Promise.all([
    supabaseAdmin.from("clients").select("*").eq("id", id).single(),
    supabaseAdmin
      .from("orders")
      .select("*")
      .eq("client_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (!client) notFound();

  return (
    <div>
      <Link href="/admin/clientes" className="mb-4 inline-block text-sm text-zinc-500 hover:text-zinc-800">
        ← Clientes
      </Link>

      <div className="mb-6">
        <ClientEditor client={client as Client} />
      </div>

      <OrdersTable initialOrders={(orders as Order[]) ?? []} />
    </div>
  );
}
