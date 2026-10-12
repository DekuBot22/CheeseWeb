import "server-only";
import type { Order } from "@/domain/order";
import { db, isMissingFunctionError, MIGRATION_005_MESSAGE } from "@/server/db";
import { AppError, NotFoundError, ValidationError } from "@/server/errors";

// Funciones SQL de la migración 005 (abonar, anular y editar de forma atómica).
// Cada una bloquea el pedido, recalcula sus saldos y mueve el saldo a favor del
// cliente dentro de una sola transacción.

interface RpcOrderResult {
  order: Order;
  credit_added?: number;
  credit_delta?: number;
}

// Mensajes que lanza la base (`raise exception '...'`) → errores con texto claro.
const KNOWN_ERRORS: Record<string, () => AppError> = {
  pedido_no_encontrado: () => new NotFoundError("Pedido no encontrado"),
  abono_no_encontrado: () => new NotFoundError("Abono no encontrado"),
  pedido_anulado: () => new ValidationError("Este pedido está anulado"),
  pedido_ya_anulado: () => new ValidationError("Este pedido ya estaba anulado"),
  abono_ya_anulado: () => new ValidationError("Este abono ya estaba anulado"),
  motivo_invalido: () => new ValidationError("Escribe el motivo (mínimo 3 letras)"),
  monto_invalido: () => new ValidationError("Ingresa un monto válido"),
  total_invalido: () => new ValidationError("El total del pedido no es válido"),
  cantidad_invalida: () => new ValidationError("La cantidad no es válida"),
  cliente_invalido: () => new ValidationError("Ingresa un nombre de cliente válido"),
};

// Llama a una función SQL. Devuelve null si la función aún no existe
// (migración 005 sin correr), para que cada caso decida qué hacer.
async function call(fn: string, args: Record<string, unknown>): Promise<RpcOrderResult | null> {
  const { data, error } = await db().rpc(fn, args);
  if (error) {
    if (isMissingFunctionError(error)) return null;
    const known = KNOWN_ERRORS[error.message];
    if (known) throw known();
    console.error(error);
    throw new AppError("No se pudo completar la operación");
  }
  return data as RpcOrderResult;
}

async function required(fn: string, args: Record<string, unknown>): Promise<RpcOrderResult> {
  const result = await call(fn, args);
  if (!result) throw new AppError(MIGRATION_005_MESSAGE, 503);
  return result;
}

// Abono atómico. null = la función no existe todavía: se usa el camino viejo.
export async function rpcRegisterPayment(
  orderId: string,
  amount: number,
  method: string | null,
  createdAt?: string
): Promise<{ order: Order; creditAdded: number } | null> {
  const result = await call("register_payment", {
    p_order_id: orderId,
    p_amount: amount,
    p_method: method,
    p_created_at: createdAt ?? null,
  });
  return result && { order: result.order, creditAdded: Number(result.credit_added ?? 0) };
}

export function rpcVoidPayment(paymentId: string, reason: string): Promise<RpcOrderResult> {
  return required("void_payment", { p_payment_id: paymentId, p_reason: reason });
}

export function rpcVoidOrder(orderId: string, reason: string, voidPayments: boolean): Promise<RpcOrderResult> {
  return required("void_order", { p_order_id: orderId, p_reason: reason, p_void_payments: voidPayments });
}

export interface EditOrderFields {
  client_id: string;
  client_name: string;
  quantity: number;
  unit: string;
  total: number;
}

export function rpcEditOrder(orderId: string, fields: EditOrderFields): Promise<RpcOrderResult> {
  return required("edit_order", {
    p_order_id: orderId,
    p_client_id: fields.client_id,
    p_client_name: fields.client_name,
    p_quantity: fields.quantity,
    p_unit: fields.unit,
    p_total: fields.total,
  });
}
