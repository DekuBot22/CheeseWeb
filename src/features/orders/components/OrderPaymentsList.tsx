import type { Payment } from "@/domain/order";
import { isVoided } from "@/domain/void";
import { cx } from "@/lib/cx";
import { formatDateShort } from "@/lib/format";
import { Button } from "@/ui/Button";
import { Money } from "@/ui/Money";

// Abonos del pedido: los anulados salen tachados con su motivo.
export function OrderPaymentsList({
  payments,
  canVoid,
  onVoid,
}: {
  payments: Payment[];
  canVoid: boolean;
  onVoid: (payment: Payment) => void;
}) {
  if (payments.length === 0) return <p className="text-sm text-tinta-2">Todavía no tiene abonos.</p>;

  return (
    <ul className="divide-y divide-linea rounded-md border border-linea text-sm">
      {payments.map((p) => {
        const voided = isVoided(p);
        return (
          <li key={p.id} className="flex items-center justify-between gap-3 px-3 py-2">
            <div className={cx("min-w-0", voided && "text-tinta-3 line-through")}>
              <Money value={Number(p.amount)} tone={voided ? "neutral" : "cobrado"} />
              <p className="text-xs">
                {formatDateShort(p.created_at)}
                {p.method ? ` · ${p.method}` : ""}
              </p>
              {voided && p.void_reason && <p className="text-xs no-underline">Anulado: {p.void_reason}</p>}
            </div>
            {canVoid && !voided && (
              <Button size="sm" variant="ghost" onClick={() => onVoid(p)}>
                Anular
              </Button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
