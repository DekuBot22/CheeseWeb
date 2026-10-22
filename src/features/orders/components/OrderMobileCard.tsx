import { CHEESE_TYPE_LABELS, SALT_LEVEL_LABELS } from "@/domain/catalog";
import { remainingOf, type Order } from "@/domain/order";
import { formatDateShort } from "@/lib/format";
import { Money } from "@/ui/Money";
import { isVoided } from "@/domain/void";
import { PaymentBadge } from "./OrderBadges";
import { ClientLink, MoreButton, OrderStateCell, PayButton } from "./OrderRowCells";

// Tarjeta del pedido en móvil: cliente y total, detalle, insignias y, abajo, "Abonar" a todo el ancho.
export function OrderMobileCard({
  order,
  showClient = true,
  updating,
  onToggle,
  onPay,
  onMore,
}: {
  order: Order;
  // false en el historial de un cliente: el detalle del pedido pasa a ser el título.
  showClient?: boolean;
  updating: boolean;
  onToggle: (order: Order) => void;
  onPay: (order: Order) => void;
  onMore: (order: Order) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          {showClient && (
            <p className="truncate">
              <ClientLink order={order} className="text-[0.9375rem]/[1.375rem] font-semibold" />
            </p>
          )}
          <p className={showClient ? "num text-sm/5 text-tinta-2" : "num text-[0.9375rem]/[1.375rem] text-tinta"}>
            {order.quantity} {order.unit} · {CHEESE_TYPE_LABELS[order.cheese_type]} ·{" "}
            {SALT_LEVEL_LABELS[order.salt_level]}
          </p>
          <p className="num text-xs/4 text-tinta-3">{formatDateShort(order.created_at)}</p>
          {order.note && <p className="mt-0.5 line-clamp-2 text-sm/5 italic text-tinta-2">{order.note}</p>}
        </div>
        <Money value={Number(order.total)} className="text-[0.9375rem]/[1.375rem] font-semibold text-tinta" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <OrderStateCell order={order} disabled={updating} onToggle={onToggle} />
        {!isVoided(order) && (
          <PaymentBadge status={order.payment_status}>
            {order.payment_status === "pagado" ? (
              "Pagado"
            ) : (
              <>
                Debe <Money value={remainingOf(order)} />
              </>
            )}
          </PaymentBadge>
        )}
      </div>
      <div className="flex items-center gap-2">
        <PayButton order={order} onPay={onPay} className="flex-1" />
        <span className="ml-auto">
          <MoreButton order={order} onMore={onMore} />
        </span>
      </div>
    </div>
  );
}
