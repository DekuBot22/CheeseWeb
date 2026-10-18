import "server-only";
import { bogotaDate } from "@/lib/bogota-time";
import { activeOnly } from "@/domain/void";
import { addDays, dayStart } from "@/domain/week-calendar";
import { moveOpeningEffect, openWeekEffect, voidOpeningEffect, type OpeningEffect } from "@/domain/week-effect";
import { listOrdersForStats } from "@/features/orders/server/orders.repo";
import { listProviderDiscountsForStats } from "@/features/purchases/server/provider-discounts.repo";
import { listProviderPaymentsForStats } from "@/features/purchases/server/provider-payments.repo";
import { listPurchasesForStats } from "@/features/purchases/server/purchases.repo";
import { NotFoundError, ValidationError } from "@/server/errors";
import type { EffectQuery } from "../schemas";
import type { EffectPreview } from "../types";
import { fetchWeekOpenings } from "./week-openings.repo";

async function effectFor(query: EffectQuery, today: string): Promise<OpeningEffect | null> {
  const { openings } = await fetchWeekOpenings();
  const active = activeOnly(openings);
  const dates = active.map((o) => o.start_date);

  if (query.action === "abrir") {
    if (!query.date) throw new ValidationError("Falta la fecha");
    return openWeekEffect(dates, query.date, today);
  }
  const target = active.find((o) => o.id === query.id);
  if (!target) throw new NotFoundError("Apertura no encontrada");
  if (query.action === "anular") return voidOpeningEffect(dates, target.start_date, today);
  if (!query.date) throw new ValidationError("Falta la fecha");
  return moveOpeningEffect(dates, target.start_date, query.date, today);
}

// Vista previa de una apertura: cuántos pedidos y compras (y de cuánto dinero) cambian de semana.
export async function getOpeningEffect(query: EffectQuery, now: Date = new Date()): Promise<EffectPreview> {
  const effect = await effectFor(query, bogotaDate(now));
  if (!effect) {
    return { effect: null, orders: { count: 0, total: 0 }, purchases: { count: 0, total: 0 }, providerMovements: 0 };
  }
  const start = dayStart(effect.from);
  const end = new Date(dayStart(addDays(effect.to, 1)).getTime() - 1);
  const [orders, purchases, payments, discounts] = await Promise.all([
    listOrdersForStats(start, end),
    listPurchasesForStats(effect.from, effect.to),
    listProviderPaymentsForStats(effect.from, effect.to),
    listProviderDiscountsForStats(effect.from, effect.to),
  ]);
  const sum = (rows: { total?: unknown; total_cost?: unknown }[], key: "total" | "total_cost") =>
    rows.reduce((acc, r) => acc + Number(r[key]), 0);
  return {
    effect,
    orders: { count: orders.length, total: sum(orders, "total") },
    purchases: { count: purchases.length, total: sum(purchases, "total_cost") },
    providerMovements: payments.length + discounts.length,
  };
}
