import { CHEESE_TYPE_LABELS, SALT_LEVEL_LABELS } from "@/domain/catalog";
import { remainingOf, sumActivePayments, type Payment } from "@/domain/order";
import { isVoided } from "@/domain/void";
import { formatDateShort } from "@/lib/format";
import { Button } from "@/ui/Button";
import { Callout } from "@/ui/Callout";
import { Money } from "@/ui/Money";
import { OrderPaymentsList } from "./OrderPaymentsList";
import type { OrderDetail } from "./use-order-detail";

// Detalle de un pedido: cifras, abonos y las acciones de corregirlo.
export function OrderDetailView({
  detail,
  onEdit,
  onVoid,
  onVoidPayment,
}: {
  detail: OrderDetail;
  onEdit: () => void;
  onVoid: () => void;
  onVoidPayment: (payment: Payment) => void;
}) {
  const { order, payments } = detail;
  const voided = isVoided(order);

  return (
    <div className="flex flex-col gap-4">
      {voided && <Callout tone="debe">Pedido anulado: {order.void_reason}</Callout>}

      <div>
        <p className="font-semibold text-tinta">{order.client_name}</p>
        <p className="num text-[0.8125rem] text-tinta-2">
          {order.quantity} {order.unit} · {CHEESE_TYPE_LABELS[order.cheese_type]} · {SALT_LEVEL_LABELS[order.salt_level]}
        </p>
        <p className="num text-xs text-tinta-3">
          {formatDateShort(order.created_at)}
          {order.edited_at && " · editado"}
        </p>
      </div>

      <div className="rounded-md border border-linea px-3 py-2 text-sm">
        <div className="flex justify-between">
          <span className="text-tinta-2">Total</span>
          <Money value={Number(order.total)} />
        </div>
        <div className="flex justify-between">
          <span className="text-tinta-2">Abonado</span>
          <Money value={sumActivePayments(payments)} tone="cobrado" />
        </div>
        {!voided && (
          <div className="mt-1 flex justify-between border-t border-linea pt-1 font-semibold">
            <span>Pendiente</span>
            <Money value={remainingOf(order)} tone="debe" />
          </div>
        )}
      </div>

      <section aria-labelledby="abonos" className="flex flex-col gap-2">
        <h3 id="abonos" className="text-sm font-semibold text-tinta">
          Abonos
        </h3>
        <OrderPaymentsList payments={payments} canVoid={!voided} onVoid={onVoidPayment} />
      </section>

      {!voided && (
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={onEdit}>
            Editar pedido
          </Button>
          <Button variant="ghost" className="flex-1 text-debe" onClick={onVoid}>
            Anular pedido
          </Button>
        </div>
      )}
    </div>
  );
}
