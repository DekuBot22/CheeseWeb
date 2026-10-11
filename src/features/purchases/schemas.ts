import { z } from "zod";
import { dateField, isNonNegative, isPositive, numberField, optionalText } from "@/lib/zod-helpers";

export const createPurchaseSchema = z.object({
  purchase_date: dateField("Fecha inválida"),
  kg: numberField(isPositive, "Cantidad (kg) inválida"),
  total_cost: numberField(isNonNegative, "Costo total inválido"),
  description: optionalText(300),
});

export const createProviderPaymentSchema = z.object({
  payment_date: dateField("Fecha inválida"),
  amount: numberField(isPositive, "Monto inválido"),
  method: optionalText(50),
  notes: optionalText(300),
});
