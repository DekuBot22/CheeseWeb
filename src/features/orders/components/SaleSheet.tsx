"use client";

import { useRouter } from "next/navigation";
import { Sheet } from "@/ui/Sheet";
import { avisar } from "@/ui/toast-store";
import { useWeekScope } from "@/features/shell/components/WeekScopeProvider";
import { SaleForm } from "./SaleForm";

// Hoja "Nueva venta": se usa desde Inicio (acceso rápido) y desde Pedidos.
export function SaleSheet({
  open,
  onClose,
  pricePerKg,
}: {
  open: boolean;
  onClose: () => void;
  pricePerKg: number;
}) {
  const router = useRouter();
  const { scope } = useWeekScope();

  return (
    <Sheet open={open} onClose={onClose} title="Nueva venta">
      <SaleForm
        pricePerKg={pricePerKg}
        weekView={scope.isCurrent ? undefined : scope.week}
        onDone={(order, paymentError) => {
          onClose();
          avisar(paymentError ?? (order.payment_status === "pagado" ? "Venta registrada y pagada" : "Venta registrada"));
          router.refresh();
        }}
      />
    </Sheet>
  );
}
