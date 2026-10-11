import "server-only";
import { db, fetchAll } from "@/server/db";
import { AppError } from "@/server/errors";
import type { StatPurchase } from "@/domain/accounting";
import type { Purchase } from "@/domain/purchase";

// Todas las compras, de la más vieja a la más nueva.
export function listPurchases(): Promise<Purchase[]> {
  return fetchAll<Purchase>((from, to) =>
    db().from("purchases").select("*").order("purchase_date", { ascending: true }).range(from, to)
  );
}

// Solo las columnas de la contabilidad, entre dos fechas AAAA-MM-DD (to = null → sin tope).
export function listPurchasesForStats(from: string, toDate: string | null): Promise<StatPurchase[]> {
  return fetchAll<StatPurchase>((a, b) => {
    let query = db()
      .from("purchases")
      .select("kg, total_cost, purchase_date")
      .gte("purchase_date", from)
      .order("purchase_date", { ascending: true })
      .range(a, b);
    if (toDate) query = query.lte("purchase_date", toDate);
    return query;
  });
}

// Compras completas entre dos fechas, para el Excel.
export function listPurchasesInRange(from: string, toDate: string): Promise<Purchase[]> {
  return fetchAll<Purchase>((a, b) =>
    db()
      .from("purchases")
      .select("*")
      .gte("purchase_date", from)
      .lte("purchase_date", toDate)
      .order("purchase_date", { ascending: true })
      .range(a, b)
  );
}

// Una compra por id (null si no existe).
export async function getPurchase(id: string): Promise<Purchase | null> {
  const { data } = await db().from("purchases").select("*").eq("id", id).maybeSingle();
  return (data as Purchase | null) ?? null;
}

export async function insertPurchase(row: {
  purchase_date: string;
  kg: number;
  total_cost: number;
  description: string | null;
}): Promise<Purchase> {
  const { data, error } = await db().from("purchases").insert(row).select().single();
  if (error || !data) throw new AppError("No se pudo registrar la compra");
  return data as Purchase;
}
