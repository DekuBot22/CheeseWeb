import { InstallCard } from "@/features/pwa/components/InstallCard";
import { PriceEditor } from "@/features/settings/components/PriceEditor";
import { getSettings } from "@/features/settings/server/settings.repo";
import { PageHeader } from "@/ui/PageHeader";

export const dynamic = "force-dynamic";

export default async function AjustesPage() {
  const settings = await getSettings();

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Ajustes" subtitle="Precio de venta y costo por kilo, e instalación en el teléfono." />
      <PriceEditor
        initialPrice={settings?.price_per_kg ?? null}
        initialCost={settings?.cost_per_kg ?? null}
        updatedAt={settings?.updated_at ?? null}
      />
      <InstallCard />
    </div>
  );
}
