"use client";

import { NOTE_MAX } from "@/domain/order";
import { Field, Input, Textarea } from "@/ui/Field";
import type { useSaleForm } from "./use-sale-form";

// Lo poco habitual de una venta (descuento y nota) va detrás de casillas, para que
// el formulario no se vea cargado. Al marcar una casilla aparece su campo.
export function SaleExtras({ f, uid }: { f: ReturnType<typeof useSaleForm>; uid: string }) {
  const canDiscount = f.mode === "cantidad";
  return (
    <>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-tinta">
        {canDiscount && (
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={f.showDiscount} onChange={(e) => f.toggleDiscount(e.target.checked)} />
            Descuento
          </label>
        )}
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={f.showNote} onChange={(e) => f.toggleNote(e.target.checked)} />
          Nota
        </label>
      </div>

      {canDiscount && f.showDiscount && (
        <Field
          label={`Descuento por ${f.unit === "lb" ? "libra" : "kilo"}`}
          htmlFor={`${uid}-descuento`}
          hint="Solo para esta venta: se resta del precio de cada unidad."
        >
          <Input id={`${uid}-descuento`} type="number" inputMode="numeric" step="1" min="0" value={f.discount} onChange={(e) => f.setDiscount(e.target.value)} placeholder="Ej. 1000" autoFocus />
        </Field>
      )}

      {f.showNote && (
        <Field label="Nota" htmlFor={`${uid}-nota`} hint="Ej.: 2 kilos, pero 1 y 1 separados.">
          <Textarea id={`${uid}-nota`} rows={2} maxLength={NOTE_MAX} value={f.note} onChange={(e) => f.setNote(e.target.value)} autoFocus />
        </Field>
      )}
    </>
  );
}
