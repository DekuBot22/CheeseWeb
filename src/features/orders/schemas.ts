import { z } from "zod";
import type { CheeseType, SaltLevel } from "@/domain/catalog";
import { MAX_ORDER_AMOUNT, MIN_ORDER_AMOUNT } from "@/domain/order";
import { VOID_REASON_MAX, VOID_REASON_MIN } from "@/domain/void";
import type { Unit } from "@/domain/units";
import { bogotaDate } from "@/lib/bogota-time";
import { formatCOP } from "@/lib/format";
import { isPositive, numberField, optionalText } from "@/lib/zod-helpers";
import { ValidationError } from "@/server/errors";

export const updateOrderStatusSchema = z.object({
  status: z.enum(["pendiente", "completado"], "Estado inválido"),
});

export const registerPaymentSchema = z.object({
  amount: numberField(isPositive, "Ingresa un monto válido"),
  // `.optional()` antes de transform: el formulario omite el método si está vacío.
  method: z
    .unknown()
    .optional()
    .transform((v) => (typeof v === "string" && v.trim() ? v.trim() : null)),
});

// Campo trampa del formulario público: está escondido para las personas, así que
// si viene con algo lo llenó un robot.
export function isHoneypotFilled(body: unknown): boolean {
  if (typeof body !== "object" || body === null) return false;
  const value = (body as Record<string, unknown>).website;
  return typeof value === "string" && value.trim().length > 0;
}

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
const MAX_EDIT_TOTAL = 100_000_000;

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

// ── Anular y editar ─────────────────────────────────────────────────────────

const REASON_MESSAGE = `Escribe el motivo (mínimo ${VOID_REASON_MIN} letras)`;

export const voidSchema = z.object({
  reason: z.string(REASON_MESSAGE).trim().min(VOID_REASON_MIN, REASON_MESSAGE).max(VOID_REASON_MAX, "El motivo es muy largo"),
});

export const voidOrderSchema = voidSchema.extend({
  // true: también se anulan sus abonos ("devolví el dinero"); false: quedan como saldo a favor.
  void_payments: z.boolean("Opción inválida").default(true),
});

export const editOrderSchema = z.object({
  client_name: z
    .string("Ingresa un nombre válido")
    .trim()
    .min(2, "Ingresa un nombre válido")
    .max(100, "Ingresa un nombre válido"),
  quantity: numberField((n) => isPositive(n) && n <= MAX_QUANTITY, "Ingresa una cantidad válida"),
  unit: z.enum(["kg", "lb"], "Unidad inválida"),
  total: numberField((n) => isPositive(n) && n <= MAX_EDIT_TOTAL, "Ingresa un total válido"),
});

export type EditOrderInput = z.output<typeof editOrderSchema>;

// ── Venta registrada desde el panel ─────────────────────────────────────────

// Número opcional: vacío o ausente → undefined.
const optionalNumber = z
  .unknown()
  .optional()
  .transform((v) => (v === undefined || v === null || v === "" ? undefined : Number(v)));

const optionalDate = z
  .unknown()
  .optional()
  .transform((v) => (typeof v === "string" && v.trim() ? v.trim() : null));

export const createSaleSchema = z
  .object({
    client_name: z
      .string("Ingresa un nombre válido")
      .trim()
      .min(2, "Ingresa un nombre válido")
      .max(100, "Ingresa un nombre válido"),
    mode: z.enum(["cantidad", "valor"], "Elige cómo registrar la venta"),
    quantity: optionalNumber,
    unit: z.enum(["kg", "lb"], "Unidad inválida").default("lb"),
    amount: optionalNumber,
    cheese_type: z.enum(["duro", "semi", "blando"], "Elige un tipo de queso válido").default("semi"),
    salt_level: z.enum(["alto", "intermedio", "bajo"], "Elige un nivel de sal válido").default("intermedio"),
    paid: z.boolean("Opción inválida").default(false),
    method: optionalText(50),
    date: optionalDate,
  })
  .superRefine((d, ctx) => {
    const issue = (path: string, message: string) => ctx.addIssue({ code: "custom", path: [path], message });
    if (d.mode === "cantidad") {
      const q = d.quantity;
      if (q === undefined || !Number.isFinite(q) || q <= 0 || q > MAX_QUANTITY) issue("quantity", "Ingresa una cantidad válida");
    } else {
      const a = d.amount;
      if (a === undefined || !Number.isFinite(a) || a < MIN_ORDER_AMOUNT || a > MAX_ORDER_AMOUNT) {
        issue("amount", `El valor debe estar entre ${formatCOP(MIN_ORDER_AMOUNT)} y ${formatCOP(MAX_ORDER_AMOUNT)}`);
      }
    }
    if (d.date !== null && (!/^\d{4}-\d{2}-\d{2}$/.test(d.date) || d.date > bogotaDate())) {
      issue("date", "La fecha no puede ser futura");
    }
  });

export type CreateSaleInput = z.output<typeof createSaleSchema>;
