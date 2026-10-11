import { OrderForm } from "@/features/storefront/components/OrderForm";
import { WhatsAppOrderLink } from "@/features/storefront/components/WhatsAppOrderLink";
import { CheeseWedge } from "@/features/storefront/components/CheeseWedge";
import { getSettings } from "@/features/settings/server/settings.repo";

export const dynamic = "force-dynamic";

export default async function Home() {
  const settings = await getSettings();
  const pricePerKg = settings ? Number(settings.price_per_kg) : null;
  const updatedAt = settings?.updated_at ?? null;

  return (
    <div className="flex flex-1 flex-col items-center bg-cuajada px-4 py-10 sm:py-16">
      <div className="w-full max-w-md">
        <header className="rise-in mb-8 text-center">
          <CheeseWedge className="mx-auto mb-3 h-16 w-20" />
          <h1 className="font-display text-3xl font-semibold italic text-tinta">Pedidos de Queso</h1>
          <p className="mt-1.5 text-sm text-tinta/70">Queso fresco directo del sábado a tu mesa.</p>
        </header>

        {pricePerKg ? (
          <div className="rise-in" style={{ animationDelay: "80ms" }}>
            <OrderForm pricePerKg={pricePerKg} updatedAt={updatedAt} />
            <WhatsAppOrderLink />
          </div>
        ) : (
          <div className="rounded-2xl border border-corteza bg-white p-6 text-center text-tinta/70 shadow-sm">
            El precio aún no ha sido configurado. Intenta más tarde.
          </div>
        )}
      </div>
    </div>
  );
}
