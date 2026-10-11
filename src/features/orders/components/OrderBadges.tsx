import type { ReactNode } from "react";
import type { OrderStatus, PaymentStatus } from "@/domain/order";
import { Badge } from "@/ui/Badge";

const PAYMENT_LABEL: Record<PaymentStatus, string> = {
  debe: "Debe",
  parcial: "Parcial",
  pagado: "Pagado",
};

export function PaymentBadge({ status, children }: { status: PaymentStatus; children?: ReactNode }) {
  return <Badge tone={status}>{children ?? PAYMENT_LABEL[status]}</Badge>;
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return status === "pendiente" ? (
    <Badge tone="pendiente">Pendiente</Badge>
  ) : (
    <Badge tone="listo">Listo</Badge>
  );
}
