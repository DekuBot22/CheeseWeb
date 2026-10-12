import "server-only";
import { db, fetchAll, hasVoidColumns, isMissingTableError, voidRow } from "@/server/db";
import { AppError } from "@/server/errors";
import type { StatDiscount } from "@/domain/accounting";
import type { DiscountReason, ProviderDiscount } from "@/domain/purchase";

// La tabla `provider_discounts` la crea la migración 004. Mientras el dueño no
// la corra en Supabase, las lecturas devuelven listas vacías en vez de romper
// la pantalla, y guardar responde con un mensaje claro.
async function orEmptyIfMissing<T>(read: () => Promise<T[]>): Promise<{ rows: T[]; ready: boolean }> {
  try {
    return { rows: await read(), ready: true };
  } catch (err) {
    if (isMissingTableError(err)) return { rows: [], ready: false };
    throw err;
  }
}

// Todos los descuentos (del más viejo al más nuevo) y si la tabla ya existe.
export async function listProviderDiscounts(): Promise<{ discounts: ProviderDiscount[]; ready: boolean }> {
  const { rows, ready } = await orEmptyIfMissing(() =>
    fetchAll<ProviderDiscount>((from, to) =>
      db().from("provider_discounts").select("*").order("discount_date", { ascending: true }).range(from, to)
    )
  );
  return { discounts: rows, ready };
}

// Solo las columnas de la contabilidad, entre dos fechas AAAA-MM-DD (to = null → sin tope).
export async function listProviderDiscountsForStats(from: string, toDate: string | null): Promise<StatDiscount[]> {
  const voidReady = await hasVoidColumns();
  const { rows } = await orEmptyIfMissing(() =>
    fetchAll<StatDiscount>((a, b) => {
      let query = db().from("provider_discounts").select("amount, discount_date").gte("discount_date", from);
      if (voidReady) query = query.is("voided_at", null);
      if (toDate) query = query.lte("discount_date", toDate);
      return query.order("discount_date", { ascending: true }).range(a, b);
    })
  );
  return rows;
}

// Descuentos completos entre dos fechas, para el Excel.
export async function listProviderDiscountsInRange(from: string, toDate: string): Promise<ProviderDiscount[]> {
  const { rows } = await orEmptyIfMissing(() =>
    fetchAll<ProviderDiscount>((a, b) =>
      db()
        .from("provider_discounts")
        .select("*")
        .gte("discount_date", from)
        .lte("discount_date", toDate)
        .order("discount_date", { ascending: true })
        .range(a, b)
    )
  );
  return rows;
}

// Descuentos ya aplicados a una compra concreta (para respetar su tope).
export async function listDiscountsOfPurchase(purchaseId: string): Promise<ProviderDiscount[]> {
  const { rows } = await orEmptyIfMissing(() =>
    fetchAll<ProviderDiscount>((a, b) =>
      db().from("provider_discounts").select("*").eq("purchase_id", purchaseId).range(a, b)
    )
  );
  return rows;
}

export async function insertProviderDiscount(row: {
  discount_date: string;
  amount: number;
  reason: DiscountReason;
  purchase_id: string | null;
  kg: number | null;
  notes: string | null;
}): Promise<ProviderDiscount> {
  const { data, error } = await db().from("provider_discounts").insert(row).select().single();
  if (error && isMissingTableError(error)) {
    throw new AppError(
      "Los descuentos aún no están activados: corre la migración 004 en el SQL Editor de Supabase y vuelve a intentar.",
      503
    );
  }
  if (error || !data) throw new AppError("No se pudo registrar el descuento");
  return data as ProviderDiscount;
}

export async function voidProviderDiscount(id: string, reason: string): Promise<ProviderDiscount> {
  return (await voidRow("provider_discounts", id, reason)) as unknown as ProviderDiscount;
}
