"use client";

import { useState } from "react";
import { sumActivePayments, type Order, type Payment } from "@/domain/order";
import { Callout } from "@/ui/Callout";
import { OrderDetailView } from "./OrderDetailView";
import { OrderEditForm } from "./OrderEditForm";
import { VoidOrderForm } from "./VoidOrderForm";
import { VoidPaymentForm } from "./VoidPaymentForm";
import { useOrderDetail } from "./use-order-detail";

type View = { name: "detalle" } | { name: "anular" } | { name: "editar" } | { name: "abono"; payment: Payment };

// Contenido de la hoja de detalle: cambia entre ver, editar y anular sin cerrarse.
export function OrderDetailContent({
  orderId,
  onChange,
}: {
  orderId: string;
  onChange: (order: Order, notice: string) => void;
}) {
  const { detail, error } = useOrderDetail(orderId);
  const [view, setView] = useState<View>({ name: "detalle" });

  if (error) return <Callout tone="debe">{error}</Callout>;
  if (!detail) return <p className="text-sm text-tinta-2">Cargando…</p>;

  const { order, payments } = detail;
  const back = () => setView({ name: "detalle" });

  if (view.name === "editar") {
    return <OrderEditForm detail={detail} onDone={(o) => onChange(o, "Pedido actualizado")} onCancel={back} />;
  }
  if (view.name === "anular") {
    return (
      <VoidOrderForm
        order={order}
        paidSum={sumActivePayments(payments)}
        onDone={(o) => onChange(o, "Pedido anulado")}
        onCancel={back}
      />
    );
  }
  if (view.name === "abono") {
    return (
      <VoidPaymentForm
        order={order}
        payment={view.payment}
        onDone={(o) => onChange(o, "Abono anulado")}
        onCancel={back}
      />
    );
  }
  return (
    <OrderDetailView
      detail={detail}
      onEdit={() => setView({ name: "editar" })}
      onVoid={() => setView({ name: "anular" })}
      onVoidPayment={(payment) => setView({ name: "abono", payment })}
    />
  );
}
