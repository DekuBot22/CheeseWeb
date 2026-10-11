import type { ProviderPayment, Purchase } from "./purchase";

export interface LedgerRow {
  key: string;
  date: string;
  createdAt: string;
  kind: "compra" | "pago";
  detail: string;
  compra: number;
  pago: number;
  saldo: number;
}

// Libro cronológico (lo más viejo primero): cada compra suma al saldo y cada
// pago lo reduce. A igual fecha manda la hora en que se registró.
export function buildLedger(purchases: Purchase[], payments: ProviderPayment[]): LedgerRow[] {
  const entries = [
    ...purchases.map((p) => ({
      key: `c-${p.id}`,
      date: p.purchase_date,
      createdAt: p.created_at,
      kind: "compra" as const,
      detail: [`${Number(p.kg)} kg`, p.description].filter(Boolean).join(" · "),
      compra: Number(p.total_cost),
      pago: 0,
    })),
    ...payments.map((p) => ({
      key: `p-${p.id}`,
      date: p.payment_date,
      createdAt: p.created_at,
      kind: "pago" as const,
      detail: [p.method, p.notes].filter(Boolean).join(" · "),
      compra: 0,
      pago: Number(p.amount),
    })),
  ].sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt));

  const ledger: LedgerRow[] = [];
  for (const e of entries) {
    const previous = ledger.length ? ledger[ledger.length - 1].saldo : 0;
    ledger.push({ ...e, saldo: previous + e.compra - e.pago });
  }
  return ledger;
}

// Totales de todo el tiempo: lo comprado, lo pagado y lo que se le debe al proveedor.
export function providerTotals(
  purchases: Pick<Purchase, "total_cost">[],
  payments: Pick<ProviderPayment, "amount">[]
) {
  const comprado = purchases.reduce((s, p) => s + Number(p.total_cost), 0);
  const pagado = payments.reduce((s, p) => s + Number(p.amount), 0);
  return { comprado, pagado, saldo: comprado - pagado };
}
