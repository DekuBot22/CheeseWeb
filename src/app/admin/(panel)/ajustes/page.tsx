import { InstallCard } from "@/features/pwa/components/InstallCard";
import { BackupCard } from "@/features/settings/components/BackupCard";
import { PriceEditor } from "@/features/settings/components/PriceEditor";
import { getSettings } from "@/features/settings/server/settings.repo";
import { WeeksCard } from "@/features/weeks/components/WeeksCard";
import { getWeeksOverview } from "@/features/weeks/server/get-weeks-overview";
import { PageHeader } from "@/ui/PageHeader";

export const dynamic = "force-dynamic";

export default async function AjustesPage() {
  const [settings, weeks] = await Promise.all([getSettings(), getWeeksOverview()]);

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Ajustes" subtitle="Precio de venta y costo por libra, semanas, respaldo e instalación en el teléfono." />
      <PriceEditor
        initialPrice={settings?.price_per_kg ?? null}
        initialCost={settings?.cost_per_kg ?? null}
        updatedAt={settings?.updated_at ?? null}
      />
      <WeeksCard rows={weeks.rows} context={weeks.context} ready={weeks.ready} />
      <BackupCard />
      <InstallCard />
    </div>
  );
}
