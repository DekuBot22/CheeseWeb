import { z } from "zod";
import { DISCOUNT_REASONS } from "@/domain/purchase";
import { dateField, isNonNegative, isPositive, numberField, optionalText } from "@/lib/zod-helpers";

export const createPurchaseSchema = z.object({
  purchase_date: dateField("Fecha inválida"),
  kg: numberField(isPositive, "Cantidad (kg) inválida"),
  total_cost: numberField(isNonNegative, "Costo total inválido"),
  description: optionalText(300),
  // "Llegó el lote": además de la compra, abre una semana nueva en la fecha de la compra.
  open_week: z.boolean().optional(),
});

export type CreatePurchaseInput = z.output<typeof createPurchaseSchema>;

export const createProviderPaymentSchema = z.object({
  payment_date: dateField("Fecha inválida"),
  amount: numberField(isPositive, "Monto inválido"),
  method: optionalText(50),
  notes: optionalText(300),
});

// Vacío o ausente → null; si viene algo se valida con `ok`.
const optionalValue = <T>(parse: (v: unknown) => T, ok: (value: T) => boolean, message: string) =>
  z
    .unknown()
    .optional()
    .transform((v) => (v === undefined || v === null || v === "" ? null : parse(v)))
    .refine((v) => v === null || ok(v), message);

const MAX_DISCOUNT = 100_000_000;

export const createProviderDiscountSchema = z
  .object({
    discount_date: dateField("Fecha inválida"),
    amount: numberField((n) => isPositive(n) && n <= MAX_DISCOUNT, "Monto inválido"),
    reason: z.enum(DISCOUNT_REASONS, { message: "Elige un motivo" }),
    purchase_id: optionalValue(String, (id) => /^[0-9a-f-]{36}$/i.test(id), "Compra inválida"),
    kg: optionalValue(Number, isPositive, "Kg inválidos"),
    notes: optionalText(300),
  })
  .refine((d) => d.reason !== "otro" || !!d.notes?.trim(), {
    message: "Escribe el motivo del descuento",
    path: ["notes"],
  });

export type CreateProviderDiscountInput = z.output<typeof createProviderDiscountSchema>;
