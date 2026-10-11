import "server-only";
import { db } from "@/server/db";
import { AppError } from "@/server/errors";

export async function insertPayment(row: {
  order_id: string;
  amount: number;
  method: string | null;
}): Promise<void> {
  const { error } = await db().from("payments").insert(row);
  if (error) throw new AppError("No se pudo registrar el abono");
}
