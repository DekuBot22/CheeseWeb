"use client";

import { remainingOf, type Order, type Payment } from "@/domain/order";
import { VOID_REASON_SUGGESTIONS } from "@/domain/void";
import { formatDateShort } from "@/lib/format";
import { Money } from "@/ui/Money";
import { ReasonForm } from "@/ui/ReasonForm";
import { useVoidRequest } from "./use-void-request";

export function VoidPaymentForm({
  order,
  payment,
  onDone,
  onCancel,
}: {
  order: Order;
  payment: Payment;
  onDone: (order: Order) => void;
  onCancel: () => void;
}) {
  const req = useVoidRequest(`/api/admin/payments/${payment.id}/void`, onDone);

  return (
    <ReasonForm
      suggestions={VOID_REASON_SUGGESTIONS}
      confirmLabel="Anular abono"
      loading={req.loading}
      error={req.error}
      onCancel={onCancel}
      onSubmit={(reason) => req.run({ reason })}
    >
      <p className="rounded-md bg-hoja-2 px-3 py-2 text-sm text-tinta-2">
        Abono de <Money value={Number(payment.amount)} tone="cobrado" /> del {formatDateShort(payment.created_at)}.
        Hoy el pedido de <span className="font-semibold text-tinta">{order.client_name}</span> tiene pendiente{" "}
        <Money value={remainingOf(order)} tone="debe" />; al anularlo volverá a deber esa parte.
      </p>
    </ReasonForm>
  );
}
