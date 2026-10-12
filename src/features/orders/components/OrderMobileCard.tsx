import { CHEESE_TYPE_LABELS, SALT_LEVEL_LABELS } from "@/domain/catalog";
import { remainingOf, type Order } from "@/domain/order";
import { formatDateShort } from "@/lib/format";
import { Money } from "@/ui/Money";
import { isVoided } from "@/domain/void";
import { PaymentBadge } from "./OrderBadges";
import { ClientLink, MoreButton, OrderStateCell, PayButton } from "./OrderRowCells";

export function OrderMobileCard({
  order,
  updating,
  onToggle,
  onPay,
  onMore,
}: {
  order: Order;
  updating: boolean;
  onToggle: (order: Order) => void;
  onPay: (order: Order) => void;
  onMore: (order: Order) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate">
            <ClientLink order={order} />
          </p>
          <p className="num text-[0.8125rem] text-tinta-2">
            {order.quantity} {order.unit} · {CHEESE_TYPE_LABELS[order.cheese_type]} ·{" "}
            {SALT_LEVEL_LABELS[order.salt_level]}
          </p>
          <p className="num text-xs text-tinta-3">{formatDateShort(order.created_at)}</p>
          {order.note && <p className="mt-0.5 line-clamp-2 text-[0.8125rem] italic text-tinta-2">{order.note}</p>}
        </div>
        <Money value={Number(order.total)} className="text-base font-semibold" />
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
        <span className="ml-auto flex items-center gap-1">
          <PayButton order={order} onPay={onPay} />
          <MoreButton order={order} onMore={onMore} />
        </span>
      </div>
    </div>
  );
}
