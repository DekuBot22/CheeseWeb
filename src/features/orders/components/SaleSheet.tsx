"use client";

import { useRouter } from "next/navigation";
import { Sheet } from "@/ui/Sheet";
import { avisar } from "@/ui/toast-store";
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

  return (
    <Sheet open={open} onClose={onClose} title="Nueva venta">
      <SaleForm
        pricePerKg={pricePerKg}
        onDone={(order, paymentError) => {
          onClose();
          avisar(paymentError ?? (order.payment_status === "pagado" ? "Venta registrada y pagada" : "Venta registrada"));
          router.refresh();
        }}
      />
    </Sheet>
  );
}
