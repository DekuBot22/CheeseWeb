import { remainingOf } from "@/domain/order";
import { activeOnly } from "@/domain/void";
import { currentWeek, previousWeek, type WeekCalendar } from "@/domain/week-calendar";
import { formatCOP, plural } from "@/lib/format";
import { pickParam } from "@/lib/search-params";
import { OrdersFilters } from "@/features/orders/components/OrdersFilters";
import { CHEESE_FILTERS, ORDER_PERIODS, ORDER_STATES, PAYMENT_FILTERS } from "@/features/orders/order-filters";
import { OrdersTable } from "@/features/orders/components/OrdersTable";
import { listOrders } from "@/features/orders/server/orders.repo";
import { NewSaleButton } from "@/features/orders/components/NewSaleButton";
import { getSettings } from "@/features/settings/server/settings.repo";
import { getWeekCalendar } from "@/features/weeks/server/get-week-calendar";
import { ButtonLink } from "@/ui/Button";
import { PageHeader } from "@/ui/PageHeader";

export const dynamic = "force-dynamic";

const LIMIT = 200;

type Params = { q?: string; estado?: string; pago?: string; tipo?: string; periodo?: string };

// Rango de fechas del filtro de período (undefined = todos).
function periodRange(periodo: (typeof ORDER_PERIODS)[number], cal: WeekCalendar) {
  const current = currentWeek(cal);
  if (periodo === "semana") return current;
  if (periodo === "anterior") return previousWeek(cal, current);
  return undefined;
}

// "todos" no filtra: se manda como ausente.
const orUndefined = <T extends string>(value: T) => (value === "todos" ? undefined : (value as Exclude<T, "todos">));

export default async function PedidosPage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const estado = pickParam(params.estado, ORDER_STATES);
  const pago = pickParam(params.pago, PAYMENT_FILTERS);
  const tipo = pickParam(params.tipo, CHEESE_FILTERS);
  const periodo = pickParam(params.periodo, ORDER_PERIODS);

  const cal = await getWeekCalendar();
  const [settings, orders] = await Promise.all([getSettings(), listOrders(
    {
      q: q || undefined,
      estado: orUndefined(estado),
      pago: orUndefined(pago),
      tipo: orUndefined(tipo),
      range: periodRange(periodo, cal),
    },
    LIMIT
  )]);

  const active = activeOnly(orders);
  const total = active.reduce((s, o) => s + Number(o.total), 0);
  const pendiente = active.reduce((s, o) => s + remainingOf(o), 0);
  const filtered = Boolean(q) || [estado, pago, tipo, periodo].some((v) => v !== "todos");

  return (
    <div>
      <PageHeader
        title="Pedidos"
        subtitle="Estado de cada pedido y lo que falta por cobrar."
        stretchActions
        actions={
          <>
            <NewSaleButton pricePerKg={settings ? Number(settings.price_per_kg) : 0} />
            <ButtonLink href="/admin/ajustes" variant="secondary" size="sm">
              Precio y costo
            </ButtonLink>
          </>
        }
      />

      <OrdersFilters values={{ q, estado, pago, tipo, periodo }} />

      <p className="num mb-3 text-[0.8125rem]/[1.125rem] text-tinta-2" aria-live="polite">
        {plural(orders.length, "pedido")} · vendido <strong className="font-semibold text-tinta">{formatCOP(total)}</strong> · por
        cobrar <strong className={pendiente > 0 ? "font-semibold text-debe" : "font-semibold text-tinta"}>{formatCOP(pendiente)}</strong>
        {orders.length === LIMIT && ` · mostrando los ${LIMIT} más recientes`}
      </p>

      <OrdersTable
        initialOrders={orders}
        emptyTitle={filtered ? "Ningún pedido coincide" : "Todavía no hay pedidos"}
        emptyDescription={
          filtered ? "Prueba quitando algún filtro." : "Cuando un cliente haga un pedido aparecerá aquí."
        }
      />
    </div>
  );
}
