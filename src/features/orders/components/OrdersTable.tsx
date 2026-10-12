"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Order } from "@/domain/order";
import { DataTable } from "@/ui/DataTable";
import { EmptyState } from "@/ui/EmptyState";
import { avisar } from "@/ui/toast-store";
import { OrderDetailSheet } from "./OrderDetailSheet";
import { OrderMobileCard } from "./OrderMobileCard";
import { PaymentSheet } from "./PaymentSheet";
import { buildOrderColumns } from "./order-columns";

export function OrdersTable({
  initialOrders,
  showClient = true,
  emptyTitle = "Todavía no hay pedidos",
  emptyDescription,
}: {
  initialOrders: Order[];
  showClient?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const router = useRouter();

  // Los pedidos llegan del servidor ya filtrados: si cambia el filtro (o se
  // registra algo en otra pantalla) hay que tomar la lista nueva.
  const [seen, setSeen] = useState(initialOrders);
  if (seen !== initialOrders) {
    setSeen(initialOrders);
    setOrders(initialOrders);
  }

  async function toggleStatus(order: Order) {
    const nextStatus = order.status === "pendiente" ? "completado" : "pendiente";
    setUpdatingId(order.id);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: nextStatus } : o)));
      }
    } finally {
      setUpdatingId(null);
    }
  }

  const paying = orders.find((o) => o.id === payingId) ?? null;
  const onPay = (order: Order) => setPayingId(order.id);
  const onMore = (order: Order) => setDetailId(order.id);
  const detail = orders.find((o) => o.id === detailId) ?? null;

  // Anular o editar cambia cifras de toda la pantalla: se reemplaza la fila y se recarga el servidor.
  function onChanged(updated: Order, notice: string) {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    avisar(notice);
    router.refresh();
  }

  return (
    <>
      <DataTable
        caption="Pedidos"
        columns={buildOrderColumns({ showClient, updatingId, onToggle: toggleStatus, onPay, onMore })}
        rows={orders}
        rowKey={(o) => o.id}
        empty={<EmptyState title={emptyTitle} description={emptyDescription} />}
        mobileCard={(o) => (
          <OrderMobileCard
            order={o}
            updating={updatingId === o.id}
            onToggle={toggleStatus}
            onPay={onPay}
            onMore={onMore}
          />
        )}
      />

      <PaymentSheet
        open={paying !== null}
        onClose={() => setPayingId(null)}
        orders={paying ? [paying] : []}
        initialOrderId={paying?.id}
        onPaid={(updated) => {
          setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
          avisar("Abono registrado");
        }}
      />

      <OrderDetailSheet order={detail} onClose={() => setDetailId(null)} onChange={onChanged} />
    </>
  );
}
