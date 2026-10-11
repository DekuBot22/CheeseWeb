"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/ui/Button";
import { Sheet } from "@/ui/Sheet";
import { IconPlus } from "@/ui/icons";
import { avisar } from "@/ui/toast-store";
import { PaymentSheet } from "@/features/orders/components/PaymentSheet";
import type { PayableOrder } from "@/features/orders/components/use-payment-form";
import { PurchaseForm } from "@/features/purchases/components/PurchaseForm";

// Accesos rápidos del Inicio: registrar un abono o una compra sin salir de la pantalla.
export function QuickActions({ payable }: { payable: PayableOrder[] }) {
  const router = useRouter();
  const [mode, setMode] = useState<"abono" | "compra" | null>(null);

  return (
    <>
      <Button size="sm" onClick={() => setMode("abono")}>
        <IconPlus width={16} height={16} /> Abono
      </Button>
      <Button size="sm" variant="secondary" onClick={() => setMode("compra")}>
        <IconPlus width={16} height={16} /> Compra
      </Button>

      <PaymentSheet
        open={mode === "abono"}
        onClose={() => setMode(null)}
        orders={payable}
        onPaid={() => {
          avisar("Abono registrado");
          router.refresh();
        }}
      />
      <Sheet open={mode === "compra"} onClose={() => setMode(null)} title="Nueva compra al proveedor">
        <PurchaseForm
          onDone={() => {
            setMode(null);
            avisar("Compra registrada");
            router.refresh();
          }}
        />
      </Sheet>
    </>
  );
}
