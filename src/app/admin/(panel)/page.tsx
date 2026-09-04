import { supabaseAdmin } from "@/lib/supabase";
import PriceEditor from "@/components/admin/PriceEditor";
import OrdersTable from "@/components/admin/OrdersTable";
import type { Order } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const [{ data: settings }, { data: orders }] = await Promise.all([
    supabaseAdmin
      .from("settings")
      .select("price_per_kg, cost_per_kg, updated_at")
      .eq("id", 1)
      .single(),
    supabaseAdmin
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  return (
    <div>
      <div className="mb-8">
        <PriceEditor
          initialPrice={settings?.price_per_kg ?? null}
          initialCost={settings?.cost_per_kg ?? null}
          updatedAt={settings?.updated_at ?? null}
        />
      </div>

      <OrdersTable initialOrders={(orders as Order[]) ?? []} />
    </div>
  );
}
