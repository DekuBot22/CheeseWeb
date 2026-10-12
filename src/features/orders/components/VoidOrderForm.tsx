"use client";

import { useState } from "react";
import type { Order } from "@/domain/order";
import { VOID_REASON_SUGGESTIONS } from "@/domain/void";
import { Callout } from "@/ui/Callout";
import { Money } from "@/ui/Money";
import { ReasonForm } from "@/ui/ReasonForm";
import { useVoidRequest } from "./use-void-request";

// Anular un pedido es definitivo: para corregirlo se anula y se registra de nuevo.
export function VoidOrderForm({
  order,
  paidSum,
  onDone,
  onCancel,
}: {
  order: Order;
  paidSum: number;
  onDone: (order: Order) => void;
  onCancel: () => void;
}) {
  const [voidPayments, setVoidPayments] = useState(true);
  const req = useVoidRequest(`/api/admin/orders/${order.id}/void`, onDone);

  return (
    <ReasonForm
      suggestions={VOID_REASON_SUGGESTIONS}
      confirmLabel="Anular pedido"
      loading={req.loading}
      error={req.error}
      onCancel={onCancel}
      onSubmit={(reason) => req.run({ reason, void_payments: voidPayments })}
    >
      <Callout tone="debe">
        Anular es definitivo: el pedido deja de contar en ventas, deudas y ganancias. Si te equivocaste, anúlalo y
        regístralo de nuevo.
      </Callout>

      {paidSum > 0 && (
        <fieldset className="flex flex-col gap-2 text-sm">
          <legend className="mb-1 font-medium text-tinta">
            Tiene abonos por <Money value={paidSum} tone="cobrado" />
          </legend>
          <label className="flex items-start gap-2">
            <input type="radio" name="abonos" checked={voidPayments} onChange={() => setVoidPayments(true)} className="mt-1" />
            <span>Devolví el dinero (se anulan también sus abonos)</span>
          </label>
          <label className="flex items-start gap-2">
            <input type="radio" name="abonos" checked={!voidPayments} onChange={() => setVoidPayments(false)} className="mt-1" />
            <span>Dejarlo como saldo a favor del cliente</span>
          </label>
        </fieldset>
      )}
    </ReasonForm>
  );
}
