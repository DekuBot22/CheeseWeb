"use client";

import { useState } from "react";
import { Button } from "@/ui/Button";
import { IconPlus } from "@/ui/icons";
import { SaleSheet } from "./SaleSheet";

// "+ Venta" con su hoja. En PC va en el encabezado (al final de la fila); en móvil es el
// primero de la fila y además hay un botón redondo flotante sobre la barra inferior.
export function NewSaleButton({ pricePerKg }: { pricePerKg: number }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="sm" className="md:order-last" onClick={() => setOpen(true)}>
        + Venta
      </Button>
      <NewSaleFab onClick={() => setOpen(true)} />
      <SaleSheet open={open} onClose={() => setOpen(false)} pricePerKg={pricePerKg} />
    </>
  );
}

// Solo el botón redondo con su hoja, para pantallas que no llevan "+ Venta" arriba (Clientes).
export function SaleFab({ pricePerKg }: { pricePerKg: number }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <NewSaleFab onClick={() => setOpen(true)} />
      <SaleSheet open={open} onClose={() => setOpen(false)} pricePerKg={pricePerKg} />
    </>
  );
}

// Botón redondo de "Nueva venta" que flota sobre la barra inferior (solo móvil).
export function NewSaleFab({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label="Nueva venta"
      onClick={onClick}
      className="presionable fixed right-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-20 flex size-14 items-center justify-center rounded-full bg-boton text-sobre-boton shadow-flota md:hidden"
    >
      <IconPlus width={26} height={26} />
    </button>
  );
}
