import "server-only";
import type { Payment } from "@/domain/order";
import { db, fetchAll } from "@/server/db";
import { AppError } from "@/server/errors";

// Camino viejo de abono (antes de la migración 005): una escritura suelta.
export async function insertPayment(row: {
  order_id: string;
  amount: number;
  method: string | null;
  created_at?: string;
}): Promise<void> {
  const { error } = await db().from("payments").insert(row);
  if (error) throw new AppError("No se pudo registrar el abono");
}

// Abonos de un pedido, también los anulados (se ven tachados), del más viejo al más nuevo.
export async function listPaymentsOfOrder(orderId: string): Promise<Payment[]> {
  const { data, error } = await db()
    .from("payments")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data as Payment[]) ?? [];
}

export type PaymentWithClient = Payment & { orders: { client_name: string } | null };

// Abonos entre dos instantes con el nombre del cliente, para el Excel.
export function listPaymentsInRange(start: Date, end: Date): Promise<PaymentWithClient[]> {
  return fetchAll<PaymentWithClient>((from, to) =>
    db()
      .from("payments")
      .select("*, orders(client_name)")
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString())
      .order("created_at", { ascending: true })
      .range(from, to)
  );
}

// Todos los abonos, anulados incluidos (respaldo).
export function listAllPayments(): Promise<Payment[]> {
  return fetchAll<Payment>((from, to) =>
    db().from("payments").select("*").order("created_at", { ascending: true }).range(from, to)
  );
}
