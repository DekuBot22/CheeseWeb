import "server-only";
import { buildLedger, providerTotals } from "@/domain/provider-ledger";
import { weekDateRange, weekRange } from "@/domain/week";
import { listProviderPayments } from "./provider-payments.repo";
import { listPurchases } from "./purchases.repo";

export const LEDGER_MAX_ROWS = 100;

// Todo lo que necesita la pantalla de Compras: cifras de la semana, saldo con
// el proveedor y el libro cronológico (lo más nuevo primero).
export async function getPurchasesOverview(now: Date = new Date()) {
  const [purchases, payments] = await Promise.all([listPurchases(), listProviderPayments()]);

  const week = weekRange(now);
  const { from, to } = weekDateRange(week.start, week.end);
  const weekPurchases = purchases.filter((p) => p.purchase_date >= from && p.purchase_date <= to);
  const ledger = buildLedger(purchases, payments);

  return {
    week,
    compradoSemana: weekPurchases.reduce((s, p) => s + Number(p.total_cost), 0),
    kgSemana: weekPurchases.reduce((s, p) => s + Number(p.kg), 0),
    pagadoSemana: payments
      .filter((p) => p.payment_date >= from && p.payment_date <= to)
      .reduce((s, p) => s + Number(p.amount), 0),
    totals: providerTotals(purchases, payments),
    purchaseCount: purchases.length,
    ledgerTotalRows: ledger.length,
    ledger: ledger.slice().reverse().slice(0, LEDGER_MAX_ROWS),
  };
}
