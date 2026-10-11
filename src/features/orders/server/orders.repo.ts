import "server-only";
import { db, fetchAll } from "@/server/db";
import { AppError } from "@/server/errors";
import type { StatOrder } from "@/domain/accounting";
import type { ClientOrder } from "@/domain/client-balance";
import type { Order, OrderStatus, PaymentStatus } from "@/domain/order";
import type { OpenOrder } from "@/domain/receivables";

export interface OrderFilters {
  q?: string;
  estado?: OrderStatus;
  pago?: PaymentStatus;
  range?: { start: Date; end: Date };
}

export async function listOrders(filters: OrderFilters, limit: number): Promise<Order[]> {
  let query = db().from("orders").select("*").order("created_at", { ascending: false }).limit(limit);

  if (filters.q) query = query.ilike("client_name", `%${filters.q}%`);
  if (filters.estado) query = query.eq("status", filters.estado);
  if (filters.pago) query = query.eq("payment_status", filters.pago);
  if (filters.range) {
    query = query
      .gte("created_at", filters.range.start.toISOString())
      .lte("created_at", filters.range.end.toISOString());
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data as Order[]) ?? [];
}

export async function listOrdersByClient(clientId: string): Promise<Order[]> {
  const { data } = await db()
    .from("orders")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  return (data as Order[]) ?? [];
}

export async function listPendingOrders(limit: number): Promise<Order[]> {
  const { data, error } = await db()
    .from("orders")
    .select("*")
    .eq("status", "pendiente")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data as Order[]) ?? [];
}

// Pedidos con saldo pendiente (cuentas por cobrar), de todo el tiempo.
export function listOpenOrders(): Promise<OpenOrder[]> {
  return fetchAll<OpenOrder>((from, to) =>
    db()
      .from("orders")
      .select("id, client_id, client_name, total, amount_paid, created_at")
      .neq("payment_status", "pagado")
      .order("created_at", { ascending: true })
      .range(from, to)
  );
}

// Solo las columnas de la contabilidad, de un rango (end = null → hasta hoy).
export function listOrdersForStats(start: Date, end: Date | null): Promise<StatOrder[]> {
  return fetchAll<StatOrder>((from, to) => {
    let query = db()
      .from("orders")
      .select("quantity, unit, total, amount_paid, cost_per_kg_snapshot, created_at")
      .gte("created_at", start.toISOString())
      .order("created_at", { ascending: true })
      .range(from, to);
    if (end) query = query.lte("created_at", end.toISOString());
    return query;
  });
}

// Pedidos completos de un rango, para el Excel.
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

// Una fila por pedido con lo mínimo para armar la lista de clientes.
export function listClientOrders(): Promise<ClientOrder[]> {
  return fetchAll<ClientOrder>((from, to) =>
    db()
      .from("orders")
      .select("client_id, total, amount_paid, payment_status, created_at")
      .order("created_at", { ascending: true })
      .range(from, to)
  );
}

export async function getOrder(id: string): Promise<Order | null> {
  const { data } = await db().from("orders").select("*").eq("id", id).single();
  return (data as Order | null) ?? null;
}

export async function insertOrder(row: Omit<Order, "id" | "created_at">): Promise<Order> {
  const { data, error } = await db().from("orders").insert(row).select().single();
  if (error || !data) throw new AppError("No se pudo guardar el pedido");
  return data as Order;
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  const { data, error } = await db().from("orders").update({ status }).eq("id", id).select().single();
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
