import { formatDay } from "@/lib/format";
import { activeOnly, isVoided } from "./void";
import type { Week } from "./week-calendar";
import { inWeekDate } from "./week-scope";
import { DISCOUNT_REASON_LABELS, type ProviderDiscount, type ProviderPayment, type Purchase } from "./purchase";

export interface LedgerRow {
  key: string;
  id: string;
  // Anulada: se muestra tachada con su motivo, pero no mueve el saldo.
  voided: boolean;
  voidReason: string | null;
  date: string;
  createdAt: string;
  kind: "compra" | "pago" | "descuento";
  detail: string;
  compra: number;
  pago: number;
  descuento: number;
  saldo: number;
}

type Entry = Omit<LedgerRow, "saldo">;

function discountDetail(d: ProviderDiscount, purchaseDates: Map<string, string>): string {
  const purchaseDate = d.purchase_id ? purchaseDates.get(d.purchase_id) : undefined;
  return [
    DISCOUNT_REASON_LABELS[d.reason],
    d.kg ? `${Number(d.kg)} kg` : null,
    d.notes,
    purchaseDate ? `compra del ${formatDay(purchaseDate)}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

// Libro cronológico (lo más viejo primero): cada compra suma al saldo; cada
// pago y cada descuento lo reducen. A igual fecha manda la hora de registro.
// Los movimientos anulados aparecen marcados pero no mueven el saldo.
export function buildLedger(
  purchases: Purchase[],
  payments: ProviderPayment[],
  discounts: ProviderDiscount[] = []
): LedgerRow[] {
  const purchaseDates = new Map(purchases.map((p) => [p.id, p.purchase_date]));
  const entries: Entry[] = [
    ...purchases.map((p) => ({
      key: `c-${p.id}`,
      id: p.id,
      voided: isVoided(p),
      voidReason: p.void_reason ?? null,
      date: p.purchase_date,
      createdAt: p.created_at,
      kind: "compra" as const,
      detail: [`${Number(p.kg)} kg`, p.description].filter(Boolean).join(" · "),
      compra: Number(p.total_cost),
      pago: 0,
      descuento: 0,
    })),
    ...payments.map((p) => ({
      key: `p-${p.id}`,
      id: p.id,
      voided: isVoided(p),
      voidReason: p.void_reason ?? null,
      date: p.payment_date,
      createdAt: p.created_at,
      kind: "pago" as const,
      detail: [p.method, p.notes].filter(Boolean).join(" · "),
      compra: 0,
      pago: Number(p.amount),
      descuento: 0,
    })),
    ...discounts.map((d) => ({
      key: `d-${d.id}`,
      id: d.id,
      voided: isVoided(d),
      voidReason: d.void_reason ?? null,
      date: d.discount_date,
      createdAt: d.created_at,
      kind: "descuento" as const,
      detail: discountDetail(d, purchaseDates),
      compra: 0,
      pago: 0,
      descuento: Number(d.amount),
    })),
  ].sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt));

  const ledger: LedgerRow[] = [];
  for (const e of entries) {
    const previous = ledger.length ? ledger[ledger.length - 1].saldo : 0;
    const delta = e.voided ? 0 : e.compra - e.pago - e.descuento;
    ledger.push({ ...e, saldo: previous + delta });
  }
  return ledger;
}

// Totales de todo el tiempo: lo comprado, lo pagado, lo descontado y lo que
// se le debe al proveedor (comprado − descontado − pagado).
export function providerTotals(
  purchases: Pick<Purchase, "total_cost" | "voided_at">[],
  payments: Pick<ProviderPayment, "amount" | "voided_at">[],
  discounts: Pick<ProviderDiscount, "amount" | "voided_at">[] = []
) {
  const comprado = activeOnly(purchases).reduce((s, p) => s + Number(p.total_cost), 0);
  const pagado = activeOnly(payments).reduce((s, p) => s + Number(p.amount), 0);
  const descontado = activeOnly(discounts).reduce((s, d) => s + Number(d.amount), 0);
  return { comprado, pagado, descontado, saldo: comprado - descontado - pagado };
}

// El libro de una semana: solo sus movimientos (lo más viejo primero), con el saldo acumulado
// que ya traen (no se recalcula, así sigue siendo el real) y los totales de esa semana.
// `saldo` es el del cierre de la semana: lo que se le debía al proveedor al terminar ese día.
export function scopeLedger(ledger: LedgerRow[], week: Pick<Week, "from" | "to">) {
  const rows = ledger.filter((r) => inWeekDate(week, r.date));
  const live = rows.filter((r) => !r.voided);
  const upToEnd = ledger.filter((r) => r.date <= week.to);
  return {
    rows,
    totals: {
      comprado: live.reduce((s, r) => s + r.compra, 0),
      pagado: live.reduce((s, r) => s + r.pago, 0),
      descontado: live.reduce((s, r) => s + r.descuento, 0),
      saldo: upToEnd.length ? upToEnd[upToEnd.length - 1].saldo : 0,
    },
  };
}

// Cuánto se puede seguir descontando de una compra: su costo menos lo ya
// descontado con ese purchase_id (nunca menos de 0).
export function remainingForDiscount(
  purchase: Pick<Purchase, "id" | "total_cost">,
  discounts: Pick<ProviderDiscount, "purchase_id" | "amount" | "voided_at">[]
): number {
  const used = activeOnly(discounts)
    .filter((d) => d.purchase_id === purchase.id)
    .reduce((s, d) => s + Number(d.amount), 0);
  return Math.max(Number(purchase.total_cost) - used, 0);
}
