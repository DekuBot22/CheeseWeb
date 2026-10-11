"use client";

import { useId } from "react";
import { DISCOUNT_REASONS, DISCOUNT_REASON_LABELS, type DiscountReason } from "@/domain/purchase";
import { formatCOP } from "@/lib/format";
import { cx } from "@/lib/cx";
import { Button } from "@/ui/Button";
import { Callout } from "@/ui/Callout";
import { Field, Input, Select } from "@/ui/Field";
import type { PurchaseOption } from "../types";
import { useProviderDiscountForm } from "./use-provider-discount-form";

function ReasonPicker({ value, onChange }: { value: DiscountReason; onChange: (r: DiscountReason) => void }) {
  return (
    <div role="radiogroup" aria-label="Motivo del descuento" className="flex flex-wrap gap-2">
      {DISCOUNT_REASONS.map((r) => (
        <button
          key={r}
          type="button"
          role="radio"
          aria-checked={value === r}
          onClick={() => onChange(r)}
          className={cx(
            "h-11 rounded-md border px-3 text-sm font-medium md:h-9",
            value === r
              ? "border-transparent bg-acento-suave text-acento ring-1 ring-acento/40"
              : "border-linea-fuerte text-tinta-2 hover:bg-hoja-2"
          )}
        >
          {DISCOUNT_REASON_LABELS[r]}
        </button>
      ))}
    </div>
  );
}

export function ProviderDiscountForm({
  purchases,
  ready,
  onDone,
}: {
  purchases: PurchaseOption[];
  ready: boolean;
  onDone?: () => void;
}) {
  const uid = useId();
  const { values: v, status, set, submit } = useProviderDiscountForm(purchases, onDone);

  if (!ready) {
    return (
      <Callout tone="aviso">
        Para usar descuentos, corre <code>004_descuentos_proveedor.sql</code> en Supabase (SQL Editor) y recarga esta
        página.
      </Callout>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-tinta">Motivo</span>
        <ReasonPicker value={v.reason} onChange={set.setReason} />
      </div>

      <Field
        label="Compra (opcional)"
        htmlFor={`${uid}-compra`}
        hint={v.selected ? `Puedes descontar hasta ${formatCOP(v.selected.remaining)}` : "Sin compra: descuento general de la semana"}
      >
        <Select id={`${uid}-compra`} value={v.purchaseId} onChange={(e) => set.pickPurchase(e.target.value)}>
          <option value="">Ninguna en particular</option>
          {purchases.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Fecha" htmlFor={`${uid}-fecha`}>
        <Input id={`${uid}-fecha`} type="date" required value={v.date} onChange={(e) => set.setDate(e.target.value)} />
      </Field>

      <label className="flex items-center gap-2 text-sm text-tinta-2">
        <input type="checkbox" checked={v.byKg} onChange={(e) => set.setByKg(e.target.checked)} className="h-4 w-4" />
        Calcular por kg (kg afectados × rebaja por kg)
      </label>

      {v.byKg ? (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Kg afectados" htmlFor={`${uid}-kg`}>
            <Input id={`${uid}-kg`} type="number" inputMode="decimal" step="0.01" min="0.01" value={v.kg} onChange={(e) => set.setKg(e.target.value)} placeholder="Ej. 6" />
          </Field>
          <Field label="Rebaja por kg" htmlFor={`${uid}-rebaja`} hint={v.computed > 0 ? `Total: ${formatCOP(v.computed)}` : undefined}>
            <Input id={`${uid}-rebaja`} type="number" inputMode="decimal" step="1" min="1" value={v.rebate} onChange={(e) => set.setRebate(e.target.value)} placeholder="Ej. 5000" />
          </Field>
        </div>
      ) : (
        <Field label="Monto del descuento" htmlFor={`${uid}-monto`}>
          <Input id={`${uid}-monto`} type="number" inputMode="decimal" step="1" min="1" required value={v.amount} onChange={(e) => set.setAmount(e.target.value)} placeholder="Ej. 150000" />
        </Field>
      )}

      <Field
        label={v.reason === "otro" ? "Motivo (obligatorio)" : "Nota (opcional)"}
        htmlFor={`${uid}-nota`}
      >
        <Input id={`${uid}-nota`} type="text" maxLength={300} required={v.reason === "otro"} value={v.notes} onChange={(e) => set.setNotes(e.target.value)} placeholder="Ej. llegó muy salado, lo vendí más barato" />
      </Field>

      <Button type="submit" loading={status.loading}>
        Registrar descuento
      </Button>
      <div aria-live="polite">
        {status.error && <p role="alert" className="text-sm font-medium text-debe">{status.error}</p>}
        {status.saved && !status.error && <p className="text-sm font-medium text-cobrado">✓ Descuento registrado</p>}
      </div>
    </form>
  );
}
