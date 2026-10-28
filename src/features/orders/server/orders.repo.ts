import "server-only";
import { MIGRATION_006_MESSAGE, db, fetchAll, hasVoidColumns, isMissingColumnError } from "@/server/db";
import { AppError } from "@/server/errors";
import type { StatOrder } from "@/domain/accounting";
import type { CheeseType, SaltLevel } from "@/domain/catalog";
import type { ClientOrder } from "@/domain/client-balance";
import type { Order, OrderStatus, PaymentStatus } from "@/domain/order";
import type { OpenOrder } from "@/domain/receivables";

// Hasta que se corra la migración 005 no existe `voided_at`: ahí no hay nada
// anulado y las consultas no filtran (ver `hasVoidColumns`).

export interface OrderFilters {
  q?: string;
  // "anulado" muestra solo los anulados; los demás valores solo ven vigentes.
  estado?: OrderStatus | "anulado";
  pago?: PaymentStatus;
  tipo?: CheeseType;
  range?: { start: Date; end: Date };
}

export async function listOrders(filters: OrderFilters, limit: number): Promise<Order[]> {
  const voidReady = await hasVoidColumns();
  if (filters.estado === "anulado" && !voidReady) return [];

  let query = db().from("orders").select("*").order("created_at", { ascending: false }).limit(limit);

  if (filters.q) query = query.ilike("client_name", `%${filters.q}%`);
  if (filters.estado === "anulado") query = query.not("voided_at", "is", null);
  else {
    if (filters.estado) query = query.eq("status", filters.estado);
    if (voidReady) query = query.is("voided_at", null);
  }
  if (filters.pago) query = query.eq("payment_status", filters.pago);
  if (filters.tipo) query = query.eq("cheese_type", filters.tipo);
  if (filters.range) {
    query = query
      .gte("created_at", filters.range.start.toISOString())
      .lte("created_at", filters.range.end.toISOString());
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data as Order[]) ?? [];
}

// Todos los pedidos de un cliente, también los anulados (se ven marcados en su historial).
export async function listOrdersByClient(clientId: string): Promise<Order[]> {
  const { data } = await db()
    .from("orders")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  return (data as Order[]) ?? [];
}

// Pedidos por entregar; con `range` solo los de esa semana.
export async function listPendingOrders(limit: number, range?: { start: Date; end: Date }): Promise<Order[]> {
  let query = db().from("orders").select("*").eq("status", "pendiente");
  if (await hasVoidColumns()) query = query.is("voided_at", null);
  if (range) query = query.gte("created_at", range.start.toISOString()).lte("created_at", range.end.toISOString());
  const { data, error } = await query.order("created_at", { ascending: false }).limit(limit);
  if (error) throw new Error(error.message);
  return (data as Order[]) ?? [];
}

// Pedidos con saldo pendiente (cuentas por cobrar), de todo el tiempo.
export async function listOpenOrders(): Promise<OpenOrder[]> {
  const voidReady = await hasVoidColumns();
  return fetchAll<OpenOrder>((from, to) => {
    let query = db()
      .from("orders")
      .select("id, client_id, client_name, total, amount_paid, created_at")
      .neq("payment_status", "pagado");
    if (voidReady) query = query.is("voided_at", null);
    return query.order("created_at", { ascending: true }).range(from, to);
  });
}

// Solo las columnas de la contabilidad, de un rango (end = null → hasta hoy).
export async function listOrdersForStats(start: Date, end: Date | null): Promise<StatOrder[]> {
  const voidReady = await hasVoidColumns();
  return fetchAll<StatOrder>((from, to) => {
    let query = db()
      .from("orders")
      .select("quantity, unit, total, amount_paid, cost_per_kg_snapshot, created_at")
      .gte("created_at", start.toISOString());
    if (voidReady) query = query.is("voided_at", null);
    if (end) query = query.lte("created_at", end.toISOString());
    return query.order("created_at", { ascending: true }).range(from, to);
  });
}

// Instante de cada pedido vigente (sin anular), para marcar los días con ventas en el calendario de semanas.
export async function listOrderMoments(): Promise<string[]> {
  const voidReady = await hasVoidColumns();
  const rows = await fetchAll<{ created_at: string }>((from, to) => {
    let query = db().from("orders").select("created_at");
    if (voidReady) query = query.is("voided_at", null);
    return query.order("created_at", { ascending: true }).range(from, to);
  });
  return rows.map((r) => r.created_at);
}

// Instante del pedido más antiguo (o null si no hay): tope hacia atrás del selector de semana.
export async function getFirstOrderAt(): Promise<string | null> {
  const { data, error } = await db().from("orders").select("created_at").order("created_at", { ascending: true }).limit(1);
  if (error) throw new AppError(error.message);
  return data?.[0]?.created_at ?? null;
}

// Pedidos completos de un rango (también los anulados), para el Excel.
export function listOrdersInRange(start: Date, end: Date): Promise<Order[]> {
  return fetchAll<Order>((from, to) =>
    db()
      .from("orders")
      .select("*")
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString())
      .order("created_at", { ascending: true })
      .range(from, to)
  );
}

// Todos los pedidos, anulados incluidos (respaldo).
export function listAllOrders(): Promise<Order[]> {
  return fetchAll<Order>((from, to) =>
    db().from("orders").select("*").order("created_at", { ascending: true }).range(from, to)
  );
}

// Una fila por pedido con lo mínimo para armar la lista de clientes.
export async function listClientOrders(): Promise<ClientOrder[]> {
  const voidReady = await hasVoidColumns();
  return fetchAll<ClientOrder>((from, to) => {
    let query = db().from("orders").select("client_id, total, amount_paid, payment_status, created_at");
    if (voidReady) query = query.is("voided_at", null);
    return query.order("created_at", { ascending: true }).range(from, to);
  });
}

export async function getOrder(id: string): Promise<Order | null> {
  const { data } = await db().from("orders").select("*").eq("id", id).single();
  return (data as Order | null) ?? null;
}

export type NewOrder = Omit<Order, "id" | "created_at" | "voided_at" | "void_reason" | "edited_at"> & {
  // Ventas registradas desde el panel pueden llevar una fecha pasada.
  created_at?: string;
};

export async function insertOrder(row: NewOrder): Promise<Order> {
  const { data, error } = await db().from("orders").insert(row).select().single();
  if (isMissingColumnError(error)) throw new AppError(MIGRATION_006_MESSAGE, 503);
  if (error || !data) throw new AppError("No se pudo guardar el pedido");
  return data as Order;
}

// Campos del pedido que se corrigen sin tocar dinero (el total y la cantidad van por `edit_order`).
export interface OrderFieldsPatch {
  note?: string | null;
  cheese_type?: CheeseType;
  salt_level?: SaltLevel;
  status?: OrderStatus;
  created_at?: string;
}

export async function updateOrderFields(id: string, patch: OrderFieldsPatch): Promise<Order> {
  const { data, error } = await db().from("orders").update(patch).eq("id", id).select().single();
  if (patch.note !== undefined && isMissingColumnError(error)) throw new AppError(MIGRATION_006_MESSAGE, 503);
  if (error || !data) throw new AppError("No se pudo guardar el pedido");
  return data as Order;
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  let query = db().from("orders").update({ status }).eq("id", id);
  if (await hasVoidColumns()) query = query.is("voided_at", null);
  const { data, error } = await query.select().single();
  if (error || !data) throw new AppError("No se pudo actualizar el pedido");
  return data as Order;
}

export async function updateOrderPayment(
  id: string,
  fields: { amount_paid: number; payment_status: PaymentStatus }
): Promise<Order> {
  const { data, error } = await db().from("orders").update(fields).eq("id", id).select().single();
  if (error || !data) throw new AppError("No se pudo actualizar el pedido");
  return data as Order;
}
