"use client";

import type { Order } from "@/domain/order";
import { EmptyState } from "@/ui/EmptyState";
import { Sheet } from "@/ui/Sheet";
import { useWeekScope } from "@/features/shell/components/WeekScopeProvider";
import { PaymentForm } from "./PaymentForm";
import type { PayableOrder } from "./use-payment-form";

export function PaymentSheet({
  open,
  onClose,
  orders,
  initialOrderId,
  onPaid,
}: {
  open: boolean;
  onClose: () => void;
  orders: PayableOrder[];
  initialOrderId?: string;
  onPaid: (order: Order) => void;
}) {
  const { scope } = useWeekScope();
  return (
    <Sheet open={open} onClose={onClose} title="Registrar abono">
      {orders.length === 0 ? (
        <EmptyState title="Nadie te debe nada" description="No hay pedidos con saldo pendiente." />
      ) : (
        <PaymentForm
          orders={orders}
          initialOrderId={initialOrderId}
          notice={
            scope.isCurrent
              ? undefined
              : "El abono se registra con la fecha de hoy, o la que elijas en «Otra fecha»; en Ganancias cuenta en la semana del pedido."
          }
          onDone={(order) => {
            onPaid(order);
            onClose();
          }}
        />
      )}
    </Sheet>
  );
}
