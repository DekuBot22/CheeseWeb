"use client";

import { useId } from "react";
import type { WeekContext } from "@/domain/week-hint";
import { Button } from "@/ui/Button";
import { Field, Input } from "@/ui/Field";
import { usePurchaseForm, type PurchaseDone } from "./use-purchase-form";

// `week` activa la casilla "Llegó el lote" (abrir semana nueva el día de la compra).
// `initialDate`: fecha con la que arranca (al mirar una semana pasada, su último día).
export function PurchaseForm({
  onDone,
  week,
  initialDate,
}: {
  onDone?: (info: PurchaseDone) => void;
  week?: WeekContext;
  initialDate?: string;
}) {
  const uid = useId();
  const { values, set, lot, status, submit } = usePurchaseForm(onDone, week, initialDate);

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Field label="Fecha" htmlFor={`${uid}-fecha`}>
        <Input id={`${uid}-fecha`} type="date" required value={values.date} onChange={(e) => set.date(e.target.value)} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Kilogramos" htmlFor={`${uid}-kg`}>
          <Input
            id={`${uid}-kg`}
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            required
            value={values.kg}
            onChange={(e) => set.kg(e.target.value)}
            placeholder="Ej. 50"
          />
        </Field>
        <Field label="Costo total" htmlFor={`${uid}-costo`}>
          <Input
            id={`${uid}-costo`}
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            required
            value={values.totalCost}
            onChange={(e) => set.totalCost(e.target.value)}
            placeholder="Ej. 900000"
          />
        </Field>
      </div>

      <Field label="Descripción (opcional)" htmlFor={`${uid}-desc`}>
        <Input
          id={`${uid}-desc`}
          type="text"
          maxLength={300}
          value={values.description}
          onChange={(e) => set.description(e.target.value)}
          placeholder="Ej. Lote del sábado"
        />
      </Field>

      {lot.show && (
        <label className="flex items-start gap-2 text-sm text-tinta">
          <input type="checkbox" className="mt-0.5" checked={lot.checked} onChange={(e) => lot.onChange(e.target.checked)} />
          <span>
            Llegó el lote: abrir semana nueva desde esta fecha
            <span className="block text-[0.8125rem] text-tinta-2">Lo que vendas desde ese día cuenta en la semana nueva.</span>
          </span>
        </label>
      )}

      <Button type="submit" size="sm" className="w-full md:w-auto md:self-start" loading={status.loading}>
        Registrar compra
      </Button>
      <div aria-live="polite">
        {status.error && <p role="alert" className="aparece text-sm font-medium text-debe">{status.error}</p>}
        {status.weekWarning && <p role="alert" className="aparece text-sm font-medium text-aviso">{status.weekWarning}</p>}
        {status.saved && !status.error && <p className="aparece text-sm font-medium text-cobrado">✓ Compra registrada</p>}
      </div>
    </form>
  );
}
