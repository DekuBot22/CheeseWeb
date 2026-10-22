import Link from "next/link";
import { CHEESE_TYPE_LABELS, SALT_LEVEL_LABELS, type CheeseType } from "@/domain/catalog";
import type { Order } from "@/domain/order";
import { Button } from "@/ui/Button";
import { Dot, type DotTone } from "@/ui/Dot";
import { cx } from "@/lib/cx";
import { isVoided } from "@/domain/void";
import { OrderStatusBadge, VoidedBadge } from "./OrderBadges";

// Piezas pequeñas que comparten la tabla (escritorio) y la tarjeta (móvil).

const CHEESE_DOT: Record<CheeseType, DotTone> = { duro: "cat1", semi: "cat2", blando: "cat3" };

// Tipo de queso con su punto de color y el nivel de sal: "● Duro · Sal intermedia".
export function CheeseLabel({ order }: { order: Order }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Dot tone={CHEESE_DOT[order.cheese_type]} />
      {CHEESE_TYPE_LABELS[order.cheese_type]} · {SALT_LEVEL_LABELS[order.salt_level]}
    </span>
  );
}

export function ClientLink({ order, className }: { order: Order; className?: string }) {
  const style = cx("font-medium", isVoided(order) ? "text-tinta-3 line-through" : "text-tinta", className);
  if (!order.client_id) return <span className={style}>{order.client_name}</span>;
  return (
    <Link href={`/admin/clientes/${order.client_id}`} className={cx(style, "hover:underline")}>
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

export function PayButton({
  order,
  onPay,
  className,
}: {
  order: Order;
  onPay: (order: Order) => void;
  className?: string;
}) {
  if (order.payment_status === "pagado" || isVoided(order)) return null;
  return (
    <Button size="sm" variant="secondary" className={className} onClick={() => onPay(order)}>
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
