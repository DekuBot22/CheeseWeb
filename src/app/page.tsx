import { supabaseAdmin } from "@/lib/supabase";
import OrderForm from "@/components/OrderForm";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { data: settings } = await supabaseAdmin
    .from("settings")
    .select("price_per_kg, updated_at")
    .eq("id", 1)
    .single();

  const pricePerKg = settings ? Number(settings.price_per_kg) : null;
  const updatedAt = settings?.updated_at ?? null;

  return (
    <div className="flex flex-1 flex-col items-center bg-amber-50 px-4 py-10 sm:py-16">
      <div className="w-full max-w-md">
        <header className="mb-8 text-center">
          <div className="mb-3 text-5xl">🧀</div>
          <h1 className="text-2xl font-bold text-amber-950">Pedidos de Queso</h1>
          <p className="mt-1 text-sm text-amber-800">
            Haz tu pedido y te confirmamos lo antes posible.
          </p>
        </header>

        {pricePerKg ? (
          <OrderForm pricePerKg={pricePerKg} updatedAt={updatedAt} />
        ) : (
          <div className="rounded-2xl border border-amber-200 bg-white p-6 text-center text-amber-800 shadow-sm">
            El precio aún no ha sido configurado. Intenta más tarde.
          </div>
        )}
      </div>
    </div>
  );
}
