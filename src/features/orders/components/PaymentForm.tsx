"use client";

import { useId } from "react";
import { remainingOf, type Order } from "@/domain/order";
import { formatDateShort } from "@/lib/format";
import { Button } from "@/ui/Button";
import { Field, Input, Select } from "@/ui/Field";
import { Money } from "@/ui/Money";
import { usePaymentForm, type PayableOrder } from "./use-payment-form";

export function PaymentForm({
  orders,
  initialOrderId,
  onDone,
  notice,
}: {
  orders: PayableOrder[];
  initialOrderId?: string;
  onDone: (order: Order) => void;
  // Aviso arriba del formulario (p. ej. al mirar una semana pasada).
  notice?: string;
}) {
  const uid = useId();
  const f = usePaymentForm(orders, initialOrderId, onDone);

  return (
    <form onSubmit={f.submit} className="flex flex-col gap-4">
      {notice && <p className="text-[0.8125rem]/[1.125rem] text-tinta-2">{notice}</p>}
      {f.clientNames.length > 1 && (
        <Field label="Cliente" htmlFor={`${uid}-cliente`}>
          <Select id={`${uid}-cliente`} value={f.clientName} onChange={(e) => f.pickClient(e.target.value)}>
            {f.clientNames.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </Select>
        </Field>
      )}

      {f.clientOrders.length > 1 ? (
        <Field label="Pedido" htmlFor={`${uid}-pedido`}>
          <Select id={`${uid}-pedido`} value={f.orderId} onChange={(e) => f.pickOrder(e.target.value)}>
            {f.clientOrders.map((o) => (
              <option key={o.id} value={o.id}>
                {formatDateShort(o.created_at)} · debe {remainingOf(o).toLocaleString("es-CO")}
              </option>
            ))}
          </Select>
        </Field>
      ) : (
        <p className="rounded-md bg-hoja-2 px-3 py-2 text-sm text-tinta-2">
          <span className="font-semibold text-tinta">{f.selected.client_name}</span> · pedido del{" "}
          {formatDateShort(f.selected.created_at)}
        </p>
      )}

      <div className="rounded-md border border-linea px-3 py-2 text-sm">
        <div className="flex justify-between">
          <span className="text-tinta-2">Total del pedido</span>
          <Money value={Number(f.selected.total)} />
        </div>
        <div className="flex justify-between">
          <span className="text-tinta-2">Ya abonado</span>
          <Money value={Number(f.selected.amount_paid)} tone="cobrado" />
        </div>
        <div className="mt-1 flex justify-between border-t border-linea pt-1 font-semibold">
          <span>Pendiente</span>
          <Money value={remainingOf(f.selected)} tone="debe" />
        </div>
      </div>

      <Field label="Monto del abono" htmlFor={`${uid}-monto`} error={f.error}>
        <Input
          id={`${uid}-monto`}
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0.01"
          autoFocus
          value={f.amount}
          onChange={(e) => f.setAmount(e.target.value)}
          aria-invalid={f.error ? true : undefined}
          aria-describedby={f.error ? `${uid}-monto-desc` : undefined}
        />
      </Field>

      <Field label="Método (opcional)" htmlFor={`${uid}-metodo`}>
        <Input
          id={`${uid}-metodo`}
          type="text"
          value={f.method}
          onChange={(e) => f.setMethod(e.target.value)}
          placeholder="Efectivo, Nequi…"
        />
      </Field>

      <Button type="submit" size="sm" className="w-full" loading={f.loading}>
        Registrar abono
      </Button>
    </form>
  );
}
