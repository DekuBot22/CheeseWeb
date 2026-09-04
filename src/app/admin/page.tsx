import { supabaseAdmin } from "@/lib/supabase";
import PriceEditor from "@/components/admin/PriceEditor";
import OrdersTable from "@/components/admin/OrdersTable";
import LogoutButton from "@/components/admin/LogoutButton";
import type { Order } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [{ data: settings }, { data: orders }] = await Promise.all([
    supabaseAdmin.from("settings").select("price_per_kg, updated_at").eq("id", 1).single(),
    supabaseAdmin
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-900">Panel de administrador 🧀</h1>
        <LogoutButton />
      </div>

      <div className="mb-8">
        <PriceEditor
          initialPrice={settings?.price_per_kg ?? null}
          updatedAt={settings?.updated_at ?? null}
        />
      </div>

      <OrdersTable initialOrders={(orders as Order[]) ?? []} />
    </div>
  );
}
