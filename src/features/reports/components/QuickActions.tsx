"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { WeekContext } from "@/domain/week-hint";
import { Button } from "@/ui/Button";
import { Sheet } from "@/ui/Sheet";
import { IconPlus } from "@/ui/icons";
import { avisar } from "@/ui/toast-store";
import { PaymentSheet } from "@/features/orders/components/PaymentSheet";
import { SaleSheet } from "@/features/orders/components/SaleSheet";
import type { PayableOrder } from "@/features/orders/components/use-payment-form";
import { PurchaseForm } from "@/features/purchases/components/PurchaseForm";

// Accesos rápidos del Inicio: registrar una venta, un abono o una compra sin salir de la pantalla.
export function QuickActions({
  payable,
  pricePerKg,
  week,
}: {
  payable: PayableOrder[];
  pricePerKg: number;
  week: WeekContext;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"venta" | "abono" | "compra" | null>(null);

  return (
    <>
      <Button size="sm" onClick={() => setMode("venta")}>
        <IconPlus width={16} height={16} /> Venta
      </Button>
      <Button size="sm" variant="secondary" onClick={() => setMode("abono")}>
        <IconPlus width={16} height={16} /> Abono
      </Button>
      <Button size="sm" variant="secondary" onClick={() => setMode("compra")}>
        <IconPlus width={16} height={16} /> Compra
      </Button>

      <SaleSheet open={mode === "venta"} onClose={() => setMode(null)} pricePerKg={pricePerKg} />
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
          week={week}
          onDone={({ weekOpened }) => {
            setMode(null);
            avisar(weekOpened ? "Compra registrada y semana nueva abierta" : "Compra registrada");
            router.refresh();
          }}
        />
      </Sheet>
    </>
  );
}
