import "server-only";
import { db, fetchAll, hasVoidColumns, voidRow } from "@/server/db";
import { AppError } from "@/server/errors";
import type { StatPayment } from "@/domain/accounting";
import type { ProviderPayment } from "@/domain/purchase";

// Todos los pagos al proveedor (también los anulados), del más viejo al más nuevo.
export function listProviderPayments(): Promise<ProviderPayment[]> {
  return fetchAll<ProviderPayment>((from, to) =>
    db().from("provider_payments").select("*").order("payment_date", { ascending: true }).range(from, to)
  );
}

// Solo las columnas de la contabilidad, entre dos fechas AAAA-MM-DD (to = null → sin tope).
export async function listProviderPaymentsForStats(from: string, toDate: string | null): Promise<StatPayment[]> {
  const voidReady = await hasVoidColumns();
  return fetchAll<StatPayment>((a, b) => {
    let query = db().from("provider_payments").select("amount, payment_date").gte("payment_date", from);
    if (voidReady) query = query.is("voided_at", null);
    if (toDate) query = query.lte("payment_date", toDate);
    return query.order("payment_date", { ascending: true }).range(a, b);
  });
}

// Pagos completos entre dos fechas, para el Excel.
export function listProviderPaymentsInRange(from: string, toDate: string): Promise<ProviderPayment[]> {
  return fetchAll<ProviderPayment>((a, b) =>
    db()
      .from("provider_payments")
      .select("*")
      .gte("payment_date", from)
      .lte("payment_date", toDate)
      .order("payment_date", { ascending: true })
      .range(a, b)
  );
}

export async function insertProviderPayment(row: {
  payment_date: string;
  amount: number;
  method: string | null;
  notes: string | null;
}): Promise<ProviderPayment> {
  const { data, error } = await db().from("provider_payments").insert(row).select().single();
  if (error || !data) throw new AppError("No se pudo registrar el pago");
  return data as ProviderPayment;
}

export async function voidProviderPayment(id: string, reason: string): Promise<ProviderPayment> {
  return (await voidRow("provider_payments", id, reason)) as unknown as ProviderPayment;
}
