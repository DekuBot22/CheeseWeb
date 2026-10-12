"use client";

import type { Order } from "@/domain/order";
import { Sheet } from "@/ui/Sheet";
import { OrderDetailContent } from "./OrderDetailContent";

export function OrderDetailSheet({
  order,
  onClose,
  onChange,
}: {
  order: Order | null;
  onClose: () => void;
  onChange: (order: Order, notice: string) => void;
}) {
  return (
    <Sheet open={order !== null} onClose={onClose} title="Pedido">
      {order && (
        <OrderDetailContent
          orderId={order.id}
          onChange={(updated, notice) => {
            onChange(updated, notice);
            onClose();
          }}
        />
      )}
    </Sheet>
  );
}
