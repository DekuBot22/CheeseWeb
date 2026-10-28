import { CLIENT_SORTS } from "@/domain/client-balance";
import { resolveWeek } from "@/domain/week-scope";
import { formatWeekLabel, plural } from "@/lib/format";
import { pickParam } from "@/lib/search-params";
import { ClientsTable } from "@/features/clients/components/ClientsTable";
import { ClientsToolbar } from "@/features/clients/components/ClientsToolbar";
import { getWeekCalendar } from "@/features/weeks/server/get-week-calendar";
import { getClientsOverview } from "@/features/clients/server/get-clients-overview";
import { SaleFab } from "@/features/orders/components/NewSaleButton";
import { getSettings } from "@/features/settings/server/settings.repo";
import { PageHeader } from "@/ui/PageHeader";

export const dynamic = "force-dynamic";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; orden?: string; semana?: string }>;
}) {
  const { q = "", orden, semana } = await searchParams;
  const sort = pickParam(orden, CLIENT_SORTS);
  const scope = resolveWeek(await getWeekCalendar(), semana);
  const [{ rows, totalPorCobrar }, settings] = await Promise.all([
    getClientsOverview(q, sort, scope.isCurrent ? null : scope.week),
    getSettings(),
  ]);

  return (
    <div>
      <PageHeader
        title="Clientes"
        subtitle={
          scope.isCurrent
            ? plural(rows.length, "cliente")
            : `${plural(rows.length, "cliente")} · semana ${formatWeekLabel(scope.week.start, scope.week.end)}`
        }
      />
      <ClientsToolbar query={q} sort={sort} semana={scope.param} />
      <ClientsTable rows={rows} totalPorCobrar={totalPorCobrar} searching={Boolean(q)} />
      <SaleFab pricePerKg={settings ? Number(settings.price_per_kg) : 0} />
    </div>
  );
}
