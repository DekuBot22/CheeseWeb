import { z } from "zod";
import type { CheeseType, SaltLevel } from "@/domain/catalog";
import { MAX_ORDER_AMOUNT, MIN_ORDER_AMOUNT } from "@/domain/order";
import type { Unit } from "@/domain/units";
import { formatCOP } from "@/lib/format";
import { isPositive, numberField } from "@/lib/zod-helpers";
import { ValidationError } from "@/server/errors";

export const updateOrderStatusSchema = z.object({
  status: z.enum(["pendiente", "completado"], "Estado inválido"),
});

export const registerPaymentSchema = z.object({
  amount: numberField(isPositive, "Ingresa un monto válido"),
  method: z.unknown().transform((v) => (typeof v === "string" && v.trim() ? v.trim() : null)),
});

export interface CreateOrderInput {
  client_name: string;
  // Pedido por valor en pesos: si viene, se ignoran `quantity` y `unit`.
  amount?: number;
  quantity: number;
  unit: Unit;
  cheese_type: CheeseType;
  salt_level: SaltLevel;
}

const MAX_QUANTITY = 1000;

function fail(message: string): never {
  throw new ValidationError(message);
}

function checkName(name: unknown): string {
  if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 100) {
    fail("Ingresa un nombre válido");
  }
  return name as string;
}

// El pedido por valor trae `amount`; si no, trae cantidad y unidad.
function checkAmountOrUnit(raw: Record<string, unknown>): number | undefined {
  const hasAmount = raw.amount !== undefined && raw.amount !== null && raw.amount !== "";
  if (!hasAmount) {
    if (raw.unit !== "kg" && raw.unit !== "lb") fail("Unidad inválida");
    return undefined;
  }
  const amount = Number(raw.amount);
  if (!Number.isFinite(amount) || amount < MIN_ORDER_AMOUNT || amount > MAX_ORDER_AMOUNT) {
    fail(`El valor del pedido debe estar entre ${formatCOP(MIN_ORDER_AMOUNT)} y ${formatCOP(MAX_ORDER_AMOUNT)}`);
  }
  return amount;
}

function checkOneOf<T extends string>(value: unknown, allowed: readonly T[], message: string): T {
  if (!allowed.includes(value as T)) fail(message);
  return value as T;
}

// Valida el pedido de un cliente campo por campo y en este orden, para que cada
// error sea el mensaje claro de ese campo (no el de un esquema genérico).
export function parseCreateOrder(body: unknown): CreateOrderInput {
  const raw = (typeof body === "object" && body !== null ? body : {}) as Record<string, unknown>;

  const client_name = checkName(raw.client_name);
  const amount = checkAmountOrUnit(raw);
  const cheese_type = checkOneOf<CheeseType>(raw.cheese_type, ["duro", "semi", "blando"], "Elige un tipo de queso válido");
  const salt_level = checkOneOf<SaltLevel>(raw.salt_level, ["alto", "intermedio", "bajo"], "Elige un nivel de sal válido");

  const quantity = Number(raw.quantity);
  if (amount === undefined && (!Number.isFinite(quantity) || quantity <= 0 || quantity > MAX_QUANTITY)) {
    fail("Ingresa una cantidad válida");
  }

  return { client_name, amount, quantity, unit: raw.unit as Unit, cheese_type, salt_level };
}
