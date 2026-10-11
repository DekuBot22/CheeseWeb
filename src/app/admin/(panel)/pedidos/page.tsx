import { remainingOf } from "@/domain/order";
import { shiftWeek, weekRange } from "@/domain/week";
import { formatCOP, plural } from "@/lib/format";
import { pickParam } from "@/lib/search-params";
import { OrdersFilters, ORDER_PERIODS, ORDER_STATES, PAYMENT_FILTERS } from "@/features/orders/components/OrdersFilters";
import { OrdersTable } from "@/features/orders/components/OrdersTable";
import { listOrders } from "@/features/orders/server/orders.repo";
import { ButtonLink } from "@/ui/Button";
import { PageHeader } from "@/ui/PageHeader";

export const dynamic = "force-dynamic";

const LIMIT = 200;

type Params = { q?: string; estado?: string; pago?: string; periodo?: string };

export default async function PedidosPage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const estado = pickParam(params.estado, ORDER_STATES);
  const pago = pickParam(params.pago, PAYMENT_FILTERS);
  const periodo = pickParam(params.periodo, ORDER_PERIODS);

  const current = weekRange();
  const range =
    periodo === "semana"
      ? current
      : periodo === "anterior"
        ? weekRange(shiftWeek(current.start.toISOString(), -1))
        : undefined;

  const orders = await listOrders(
    {
      q: q || undefined,
      estado: estado === "todos" ? undefined : estado,
      pago: pago === "todos" ? undefined : pago,
      range,
    },
    LIMIT
  );

  const total = orders.reduce((s, o) => s + Number(o.total), 0);
  const pendiente = orders.reduce((s, o) => s + remainingOf(o), 0);
  const filtered = Boolean(q) || estado !== "todos" || pago !== "todos" || periodo !== "todos";

  return (
    <div>
      <PageHeader
        title="Pedidos"
        subtitle="Estado de cada pedido y lo que falta por cobrar."
        actions={
          <ButtonLink href="/admin/ajustes" variant="secondary" size="sm">
            Precio y costo
          </ButtonLink>
        }
      />

      <OrdersFilters values={{ q, estado, pago, periodo }} />

      <p className="num mb-3 text-sm text-tinta-2" aria-live="polite">
        {plural(orders.length, "pedido")} · vendido <strong className="text-tinta">{formatCOP(total)}</strong> · por
        cobrar <strong className={pendiente > 0 ? "text-debe" : "text-tinta"}>{formatCOP(pendiente)}</strong>
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
