import { CLIENT_SORTS } from "@/domain/client-balance";
import { plural } from "@/lib/format";
import { pickParam } from "@/lib/search-params";
import { ClientsTable } from "@/features/clients/components/ClientsTable";
import { ClientsToolbar } from "@/features/clients/components/ClientsToolbar";
import { getClientsOverview } from "@/features/clients/server/get-clients-overview";
import { SaleFab } from "@/features/orders/components/NewSaleButton";
import { getSettings } from "@/features/settings/server/settings.repo";
import { PageHeader } from "@/ui/PageHeader";

export const dynamic = "force-dynamic";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; orden?: string }>;
}) {
  const { q = "", orden } = await searchParams;
  const sort = pickParam(orden, CLIENT_SORTS);
  const [{ rows, totalPorCobrar }, settings] = await Promise.all([getClientsOverview(q, sort), getSettings()]);

  return (
    <div>
      <PageHeader title="Clientes" subtitle={plural(rows.length, "cliente")} />
      <ClientsToolbar query={q} sort={sort} />
      <ClientsTable rows={rows} totalPorCobrar={totalPorCobrar} searching={Boolean(q)} />
      <SaleFab pricePerKg={settings ? Number(settings.price_per_kg) : 0} />
    </div>
  );
}
