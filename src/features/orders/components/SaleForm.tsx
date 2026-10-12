"use client";

import { useId } from "react";
import { CHEESE_TYPE_LABELS, SALT_LEVEL_LABELS, type CheeseType, type SaltLevel } from "@/domain/catalog";
import type { Order } from "@/domain/order";
import { toKg, type Unit } from "@/domain/units";
import { formatCOP } from "@/lib/format";
import { bogotaDate } from "@/lib/bogota-time";
import { Button } from "@/ui/Button";
import { Field, Input, Select } from "@/ui/Field";
import { Money } from "@/ui/Money";
import { ClientPicker } from "./ClientPicker";
import { useClientNames } from "./use-client-names";
import { useSaleForm, type SaleMode } from "./use-sale-form";

export function SaleForm({
  pricePerKg,
  onDone,
}: {
  pricePerKg: number;
  onDone: (order: Order, paymentError?: string) => void;
}) {
  const uid = useId();
  const names = useClientNames();
  const f = useSaleForm(pricePerKg, onDone);

  return (
    <form onSubmit={f.submit} className="flex flex-col gap-4">
      <ClientPicker value={f.clientName} names={names} onChange={f.setClientName} />

      <Field label="Cómo la registras" htmlFor={`${uid}-modo`}>
        <Select id={`${uid}-modo`} value={f.mode} onChange={(e) => f.setMode(e.target.value as SaleMode)}>
          <option value="cantidad">Por cantidad</option>
          <option value="valor">Por valor ($)</option>
        </Select>
      </Field>

      {f.mode === "cantidad" ? (
        <>
        <div className="grid grid-cols-[1fr_7rem] gap-3">
          <Field label="Cantidad" htmlFor={`${uid}-cantidad`}>
            <Input id={`${uid}-cantidad`} type="number" inputMode="decimal" step="0.01" min="0.01" value={f.quantity} onChange={(e) => f.setQuantity(e.target.value)} />
          </Field>
          <Field label="Unidad" htmlFor={`${uid}-unidad`}>
            <Select id={`${uid}-unidad`} value={f.unit} onChange={(e) => f.setUnit(e.target.value as Unit)}>
              <option value="lb">lb</option>
              <option value="kg">kg</option>
            </Select>
          </Field>
        </div>
        <Field
          label={`Descuento por ${f.unit === "lb" ? "libra" : "kilo"} (opcional)`}
          htmlFor={`${uid}-descuento`}
          hint="Solo para esta venta: se resta del precio de cada unidad."
        >
          <Input id={`${uid}-descuento`} type="number" inputMode="numeric" step="1" min="0" value={f.discount} onChange={(e) => f.setDiscount(e.target.value)} placeholder="Ej. 1000" />
        </Field>
        </>
      ) : (
        <Field label="Valor de la venta" htmlFor={`${uid}-valor`}>
          <Input id={`${uid}-valor`} type="number" inputMode="numeric" step="1" min="1" value={f.amount} onChange={(e) => f.setAmount(e.target.value)} />
        </Field>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Field label="Queso" htmlFor={`${uid}-queso`}>
          <Select id={`${uid}-queso`} value={f.cheese} onChange={(e) => f.setCheese(e.target.value as CheeseType)}>
            {Object.entries(CHEESE_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>
        </Field>
        <Field label="Sal" htmlFor={`${uid}-sal`}>
          <Select id={`${uid}-sal`} value={f.salt} onChange={(e) => f.setSalt(e.target.value as SaltLevel)}>
            {Object.entries(SALT_LEVEL_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Fecha (opcional)" htmlFor={`${uid}-fecha`} hint="Si la dejas vacía es de hoy.">
        <Input id={`${uid}-fecha`} type="date" max={bogotaDate()} value={f.date} onChange={(e) => f.setDate(e.target.value)} />
      </Field>

      <label className="flex items-center gap-2 text-sm text-tinta">
        <input type="checkbox" checked={f.paid} onChange={(e) => f.setPaid(e.target.checked)} />
        Ya pagó (se registra el abono completo)
      </label>
      {f.paid && (
        <Field label="Método (opcional)" htmlFor={`${uid}-metodo`}>
          <Input id={`${uid}-metodo`} value={f.method} onChange={(e) => f.setMethod(e.target.value)} placeholder="Efectivo, Nequi…" />
        </Field>
      )}

      {f.discountPerUnit > 0 && f.total > 0 && (
        <p className="aparece text-[0.8125rem] text-tinta-2">
          Precio con descuento: {formatCOP(Math.round(f.salePricePerKg * toKg(1, f.unit)))} por {f.unit === "lb" ? "libra" : "kilo"}
          {" · "}el cliente ahorra {formatCOP(f.saved)}
        </p>
      )}

      <div className="flex items-center justify-between border-t border-linea pt-3 text-sm">
        <span className="text-tinta-2">Total estimado</span>
        <Money value={f.total} className="text-base font-semibold" />
      </div>

      {f.error && (
        <p role="alert" className="aparece text-[0.8125rem] font-medium text-debe">
          {f.error}
        </p>
      )}

      <Button type="submit" loading={f.loading}>
        Registrar venta
      </Button>
    </form>
  );
}
