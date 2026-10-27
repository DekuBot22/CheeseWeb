import "server-only";
import { bogotaDate } from "@/lib/bogota-time";
import { activeOnly } from "@/domain/void";
import { addDays, dayStart } from "@/domain/week-calendar";
import { affectedWeeks, calendarChanges, moveOpeningEffect, openWeekEffect, voidOpeningEffect, type OpeningEffect } from "@/domain/week-effect";
import { planWeekRange } from "@/domain/week-range";
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

const EMPTY: EffectPreview = { effect: null, orders: { count: 0, total: 0 }, purchases: { count: 0, total: 0 }, providerMovements: 0 };

function loadMovements(from: string, to: string) {
  const start = dayStart(from);
  const end = new Date(dayStart(addDays(to, 1)).getTime() - 1);
  return Promise.all([
    listOrdersForStats(start, end),
    listPurchasesForStats(from, to),
    listProviderPaymentsForStats(from, to),
    listProviderDiscountsForStats(from, to),
  ]).then(([orders, purchases, payments, discounts]) => ({ orders, purchases, payments, discounts }));
}

// Vista previa de "desde / hasta": lo que cambia de semana en cualquier punto de la historia y cómo quedan las semanas.
async function getRangeEffect(query: EffectQuery, today: string): Promise<EffectPreview> {
  if (!query.from) throw new ValidationError("Falta la fecha de inicio");
  const { openings } = await fetchWeekOpenings();
  const active = activeOnly(openings);
  const refs = active.map((o) => ({ id: o.id, date: o.start_date }));
  const plan = planWeekRange(refs, { from: query.from, until: query.until ?? null, editingId: query.id }, today);
  if (!plan.ok) throw new ValidationError(plan.error);

  const segments = calendarChanges(active.map((o) => o.start_date), plan.after, today);
  const after = affectedWeeks(plan.after, segments, today).map((w) => ({ from: w.from, to: w.to, days: w.days }));
  if (segments.length === 0) return { ...EMPTY, after };

  const inSegments = (date: string) => segments.some((s) => date >= s.from && date <= s.to);
  const first = segments.reduce((min, s) => (s.from < min ? s.from : min), segments[0].from);
  const last = segments.reduce((max, s) => (s.to > max ? s.to : max), segments[0].to);
  const moved = await loadMovements(first, last);
  const orders = moved.orders.filter((o) => inSegments(bogotaDate(new Date(o.created_at))));
  const purchases = moved.purchases.filter((p) => inSegments(p.purchase_date));
  const payments = moved.payments.filter((p) => inSegments(p.payment_date));
  const discounts = moved.discounts.filter((d) => inSegments(d.discount_date));
  const effect: OpeningEffect = { from: first, to: last, fromWeek: segments[0].fromWeek, toWeek: segments[0].toWeek };
  return {
    effect,
    orders: { count: orders.length, total: orders.reduce((acc, r) => acc + Number(r.total), 0) },
    purchases: { count: purchases.length, total: purchases.reduce((acc, r) => acc + Number(r.total_cost), 0) },
    providerMovements: payments.length + discounts.length,
    after,
  };
}

// Vista previa de una apertura: cuántos pedidos y compras (y de cuánto dinero) cambian de semana.
export async function getOpeningEffect(query: EffectQuery, now: Date = new Date()): Promise<EffectPreview> {
  const today = bogotaDate(now);
  if (query.action === "rango") return getRangeEffect(query, today);
  const effect = await effectFor(query, today);
  if (!effect) {
    return EMPTY;
  }
  const { orders, purchases, payments, discounts } = await loadMovements(effect.from, effect.to);
  const sum = (rows: { total?: unknown; total_cost?: unknown }[], key: "total" | "total_cost") =>
    rows.reduce((acc, r) => acc + Number(r[key]), 0);
  return {
    effect,
    orders: { count: orders.length, total: sum(orders, "total") },
    purchases: { count: purchases.length, total: sum(purchases, "total_cost") },
    providerMovements: payments.length + discounts.length,
  };
}
