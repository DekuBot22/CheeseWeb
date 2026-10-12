"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { VOID_REASON_SUGGESTIONS } from "@/domain/void";
import { Button } from "@/ui/Button";
import { ReasonForm } from "@/ui/ReasonForm";
import { Sheet } from "@/ui/Sheet";
import { avisar } from "@/ui/toast-store";

export type MovementKind = "compra" | "pago" | "descuento";

const ENDPOINTS: Record<MovementKind, string> = {
  compra: "purchases",
  pago: "provider-payments",
  descuento: "provider-discounts",
};

const TITLES: Record<MovementKind, string> = {
  compra: "Anular compra",
  pago: "Anular pago",
  descuento: "Anular descuento",
};

// Anula una fila del libro del proveedor con un motivo. La hoja solo se monta
// cuando se pulsa el botón por primera vez (el libro puede tener cientos de filas).
export function VoidMovementButton({ kind, id, label }: { kind: MovementKind; id: string; label: string }) {
  const router = useRouter();
  const [opened, setOpened] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(reason: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/${ENDPOINTS[kind]}/${id}/void`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo anular");
        return;
      }
      setOpen(false);
      avisar("Movimiento anulado");
      router.refresh();
    } catch {
      setError("No se pudo conectar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        aria-label={`Anular ${label}`}
        onClick={() => {
          setOpened(true);
          setOpen(true);
        }}
      >
        Anular
      </Button>
      {opened && (
        <Sheet open={open} onClose={() => setOpen(false)} title={TITLES[kind]}>
          <ReasonForm
            suggestions={VOID_REASON_SUGGESTIONS}
            confirmLabel={TITLES[kind]}
            loading={loading}
            error={error}
            onSubmit={submit}
            onCancel={() => setOpen(false)}
          >
            <p className="rounded-md bg-hoja-2 px-3 py-2 text-sm text-tinta-2">
              {label}. Anular es definitivo: deja de contar en el saldo y en la ganancia, pero queda en el libro con su
              motivo.
            </p>
          </ReasonForm>
        </Sheet>
      )}
    </>
  );
}
