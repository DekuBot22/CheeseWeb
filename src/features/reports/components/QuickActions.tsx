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
// En móvil, "+ Venta" va primero y además hay un botón flotante; en PC va al final, a la derecha.
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
      <Button size="sm" className="md:order-last" onClick={() => setMode("venta")}>
        + Venta
      </Button>
      <Button size="sm" variant="secondary" onClick={() => setMode("abono")}>
        + Abono
      </Button>
      <Button size="sm" variant="secondary" onClick={() => setMode("compra")}>
        + Compra
      </Button>

      <button
        type="button"
        aria-label="Nueva venta"
        onClick={() => setMode("venta")}
        className="presionable fixed right-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-20 flex size-14 items-center justify-center rounded-full bg-boton text-sobre-boton shadow-flota md:hidden"
      >
        <IconPlus width={26} height={26} />
      </button>

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
