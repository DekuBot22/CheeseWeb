import Link from "next/link";
import type { Order } from "@/domain/order";
import { Button } from "@/ui/Button";
import { isVoided } from "@/domain/void";
import { OrderStatusBadge, VoidedBadge } from "./OrderBadges";

// Piezas pequeñas que comparten la tabla (escritorio) y la tarjeta (móvil).

export function ClientLink({ order }: { order: Order }) {
  if (!order.client_id) return <span className="font-semibold text-tinta">{order.client_name}</span>;
  return (
    <Link href={`/admin/clientes/${order.client_id}`} className="font-semibold text-tinta hover:underline">
      {order.client_name}
    </Link>
  );
}

export function StatusToggle({
  order,
  disabled,
  onToggle,
}: {
  order: Order;
  disabled: boolean;
  onToggle: (order: Order) => void;
}) {
  const label =
    order.status === "pendiente"
      ? `Marcar el pedido de ${order.client_name} como listo`
      : `Volver a pendiente el pedido de ${order.client_name}`;
  return (
    <button
      type="button"
      onClick={() => onToggle(order)}
      disabled={disabled}
      aria-label={label}
      className="presionable rounded-full [--escala-press:0.94] disabled:opacity-60"
    >
      <OrderStatusBadge status={order.status} />
    </button>
  );
}

export function PayButton({ order, onPay }: { order: Order; onPay: (order: Order) => void }) {
  if (order.payment_status === "pagado" || isVoided(order)) return null;
  return (
    <Button size="sm" variant="secondary" onClick={() => onPay(order)}>
      Abonar
    </Button>
  );
}

// Abre el detalle: ver abonos, editar o anular.
export function MoreButton({ order, onMore }: { order: Order; onMore: (order: Order) => void }) {
  return (
    <Button size="sm" variant="ghost" onClick={() => onMore(order)} aria-label={`Más acciones del pedido de ${order.client_name}`}>
      Más
    </Button>
  );
}

// El estado de entrega o, si el pedido está anulado, la insignia "Anulado".
export function OrderStateCell({
  order,
  disabled,
  onToggle,
}: {
  order: Order;
  disabled: boolean;
  onToggle: (order: Order) => void;
}) {
  return isVoided(order) ? <VoidedBadge /> : <StatusToggle order={order} disabled={disabled} onToggle={onToggle} />;
}
