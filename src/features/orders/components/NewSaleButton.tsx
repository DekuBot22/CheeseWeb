"use client";

import { useState } from "react";
import { Button } from "@/ui/Button";
import { IconPlus } from "@/ui/icons";
import { SaleSheet } from "./SaleSheet";

// Botón "+ Venta" con su hoja, para el encabezado de Pedidos.
export function NewSaleButton({ pricePerKg }: { pricePerKg: number }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <IconPlus width={16} height={16} /> Venta
      </Button>
      <SaleSheet open={open} onClose={() => setOpen(false)} pricePerKg={pricePerKg} />
    </>
  );
}
