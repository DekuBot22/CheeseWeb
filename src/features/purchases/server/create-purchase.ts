import "server-only";
import type { Purchase } from "@/domain/purchase";
import { AppError } from "@/server/errors";
import { openWeek } from "@/features/weeks/server/manage-week-openings";
import type { CreatePurchaseInput } from "../schemas";
import { insertPurchase } from "./purchases.repo";

export interface CreatedPurchase {
  purchase: Purchase;
  weekOpened: boolean;
  // Si la compra se guardó pero la semana no se pudo abrir (fecha inválida, falta la migración 007…).
  weekError?: string;
}

// Registra una compra; con `open_week` también abre la semana nueva el día de la compra.
// La compra manda: si la apertura falla, la compra queda guardada y se avisa por separado.
export async function createPurchase(input: CreatePurchaseInput): Promise<CreatedPurchase> {
  const { open_week, ...row } = input;
  const purchase = await insertPurchase(row);
  if (!open_week) return { purchase, weekOpened: false };

  try {
    await openWeek({ start_date: row.purchase_date, note: "Llegó el lote" });
    return { purchase, weekOpened: true };
  } catch (error) {
    if (!(error instanceof AppError)) throw error;
    return { purchase, weekOpened: false, weekError: error.message };
  }
}
