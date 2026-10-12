"use client";

import { useId } from "react";
import { PAYMENT_STATUS_LABELS, type Order } from "@/domain/order";
import { formatCOP } from "@/lib/format";
import { Button } from "@/ui/Button";
import { Callout } from "@/ui/Callout";
import { Field, Input, Select } from "@/ui/Field";
import type { OrderDetail } from "./use-order-detail";
import { useOrderEdit } from "./use-order-edit";

// Texto del aviso cuando el pedido ya tiene abonos y el cambio mueve el saldo a favor.
function previewText(
  preview: NonNullable<ReturnType<typeof useOrderEdit>["preview"]>,
  paidSum: number,
  clientName: string
): string {
  const status = PAYMENT_STATUS_LABELS[preview.after.paymentStatus];
  const base = `Tiene abonos por ${formatCOP(paidSum)}. Al guardar quedará: ${status}`;
  if (preview.creditDelta > 0) {
    return `${base}, y ${formatCOP(preview.creditDelta)} pasará a saldo a favor de ${clientName}.`;
  }
  if (preview.creditDelta < 0) {
    return `${base}, usando ${formatCOP(-preview.creditDelta)} del saldo a favor de ${clientName}.`;
  }
  return `${base}.`;
}

export function OrderEditForm({
  detail,
  onDone,
  onCancel,
}: {
  detail: OrderDetail;
  onDone: (order: Order) => void;
  onCancel: () => void;
}) {
  const uid = useId();
  const f = useOrderEdit(detail, onDone);

  return (
    <form onSubmit={f.submit} className="flex flex-col gap-4">
      <Field label="Cliente" htmlFor={`${uid}-cliente`} hint="Si escribes otro nombre, el pedido pasa a ese cliente.">
        <Input id={`${uid}-cliente`} value={f.clientName} onChange={(e) => f.setClientName(e.target.value)} />
      </Field>

      <div className="grid grid-cols-[1fr_7rem] gap-3">
        <Field label="Cantidad" htmlFor={`${uid}-cantidad`}>
          <Input
            id={`${uid}-cantidad`}
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            value={f.quantity}
            onChange={(e) => f.changeQuantity(e.target.value)}
          />
        </Field>
        <Field label="Unidad" htmlFor={`${uid}-unidad`}>
          <Select id={`${uid}-unidad`} value={f.unit} onChange={(e) => f.changeUnit(e.target.value as "kg" | "lb")}>
            <option value="lb">lb</option>
            <option value="kg">kg</option>
          </Select>
        </Field>
      </div>

      <Field
        label="Total del pedido"
        htmlFor={`${uid}-total`}
        error={f.error}
        hint="Se calcula con el precio de ese día; puedes escribir otro valor."
      >
        <Input
          id={`${uid}-total`}
          type="number"
          inputMode="decimal"
          step="1"
          min="1"
          value={f.total}
          onChange={(e) => f.changeTotal(e.target.value)}
          aria-invalid={f.error ? true : undefined}
          aria-describedby={`${uid}-total-desc`}
        />
      </Field>

      {f.preview && <Callout tone="info">{previewText(f.preview, f.paidSum, f.clientName)}</Callout>}

      <div className="flex gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Volver
        </Button>
        <Button type="submit" loading={f.loading} className="flex-1">
          Guardar cambios
        </Button>
      </div>
    </form>
  );
}
