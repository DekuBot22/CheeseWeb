import "server-only";
import { buildLedger, providerTotals, remainingForDiscount } from "@/domain/provider-ledger";
import { activeOnly } from "@/domain/void";
import type { ProviderDiscount, Purchase } from "@/domain/purchase";
import { currentWeek } from "@/domain/week-calendar";
import { getWeekCalendar } from "@/features/weeks/server/get-week-calendar";
import { formatCOP, formatDay } from "@/lib/format";
import type { PurchaseOption } from "../types";
import { listProviderDiscounts } from "./provider-discounts.repo";
import { listProviderPayments } from "./provider-payments.repo";
import { listPurchases } from "./purchases.repo";

export const LEDGER_MAX_ROWS = 100;
const PURCHASE_OPTIONS = 12;

// Las últimas compras que todavía admiten descuento, la más nueva primero.
function purchaseOptions(purchases: Purchase[], discounts: ProviderDiscount[]): PurchaseOption[] {
  return purchases
    .slice()
    .reverse()
    .map((p) => ({ p, remaining: remainingForDiscount(p, discounts) }))
    .filter(({ remaining }) => remaining > 0)
    .slice(0, PURCHASE_OPTIONS)
    .map(({ p, remaining }) => ({
      id: p.id,
      label: `${formatDay(p.purchase_date)} · ${Number(p.kg)} kg · ${formatCOP(Number(p.total_cost))}`,
      date: p.purchase_date,
      remaining,
    }));
}

// Todo lo que necesita la pantalla de Compras: cifras de la semana, saldo con
// el proveedor y el libro cronológico (lo más nuevo primero).
export async function getPurchasesOverview(now: Date = new Date()) {
  const [purchases, payments, { discounts, ready }] = await Promise.all([
    listPurchases(),
    listProviderPayments(),
    listProviderDiscounts(),
  ]);

  const week = currentWeek(await getWeekCalendar(now));
  const { from, to } = week;
  const inWeek = (date: string) => date >= from && date <= to;
  const weekPurchases = activeOnly(purchases).filter((p) => inWeek(p.purchase_date));
  // Lo anulado fue un error: desaparece del libro (en la base queda guardado, no se borra).
  const ledger = buildLedger(activeOnly(purchases), activeOnly(payments), activeOnly(discounts));

  return {
    week,
    compradoSemana: weekPurchases.reduce((s, p) => s + Number(p.total_cost), 0),
    kgSemana: weekPurchases.reduce((s, p) => s + Number(p.kg), 0),
    pagadoSemana: activeOnly(payments).filter((p) => inWeek(p.payment_date)).reduce((s, p) => s + Number(p.amount), 0),
    descontadoSemana: activeOnly(discounts).filter((d) => inWeek(d.discount_date)).reduce((s, d) => s + Number(d.amount), 0),
    totals: providerTotals(purchases, payments, discounts),
    purchaseCount: activeOnly(purchases).length,
    discountsReady: ready,
    purchaseOptions: purchaseOptions(activeOnly(purchases), discounts),
    ledgerTotalRows: ledger.length,
    ledger: ledger.slice().reverse().slice(0, LEDGER_MAX_ROWS),
  };
}
