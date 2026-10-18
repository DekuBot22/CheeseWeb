import type { Order, Payment } from "@/domain/order";
import type { ProviderDiscount, ProviderPayment, Purchase } from "@/domain/purchase";
import type { WeekOpening } from "@/domain/week-opening";
import { DISCOUNT_REASON_LABELS } from "@/domain/purchase";
import { isVoided } from "@/domain/void";

// Una fila de la hoja "Anulados" del Excel: lo que se anuló, cuándo y por qué.
export interface VoidedRow {
  tipo: string;
  fecha: string;
  detalle: string;
  // null en lo que no tiene monto (apertura de semana).
  monto: number | null;
  anuladoEl: string;
  motivo: string;
}

export interface VoidableSources {
  orders: Order[];
  payments: (Payment & { orders?: { client_name: string } | null })[];
  purchases: Purchase[];
  providerPayments: ProviderPayment[];
  discounts: ProviderDiscount[];
  weekOpenings?: WeekOpening[];
}

const bogota = (iso: string) => new Date(iso).toLocaleString("es-CO", { timeZone: "America/Bogota" });

// Junta en una sola lista, de la anulación más reciente a la más vieja, todo lo anulado.
export function buildVoidedRows(src: VoidableSources): VoidedRow[] {
  const rows: { at: string; row: VoidedRow }[] = [];
  const push = (row: Omit<VoidedRow, "anuladoEl" | "motivo">, voidedAt: string, reason: string | null | undefined) =>
    rows.push({ at: voidedAt, row: { ...row, anuladoEl: bogota(voidedAt), motivo: reason ?? "" } });

  for (const o of src.orders.filter(isVoided)) {
    push({ tipo: "Pedido", fecha: bogota(o.created_at), detalle: `${o.client_name} · ${o.quantity} ${o.unit}`, monto: Number(o.total) }, o.voided_at!, o.void_reason);
  }
  for (const p of src.payments.filter(isVoided)) {
    push({ tipo: "Abono", fecha: bogota(p.created_at), detalle: p.orders?.client_name ?? "", monto: Number(p.amount) }, p.voided_at!, p.void_reason);
  }
  for (const p of src.purchases.filter(isVoided)) {
    push({ tipo: "Compra", fecha: p.purchase_date, detalle: `${Number(p.kg)} kg`, monto: Number(p.total_cost) }, p.voided_at!, p.void_reason);
  }
  for (const p of src.providerPayments.filter(isVoided)) {
    push({ tipo: "Pago a proveedor", fecha: p.payment_date, detalle: p.method ?? "", monto: Number(p.amount) }, p.voided_at!, p.void_reason);
  }
  for (const d of src.discounts.filter(isVoided)) {
    push({ tipo: "Descuento proveedor", fecha: d.discount_date, detalle: DISCOUNT_REASON_LABELS[d.reason], monto: Number(d.amount) }, d.voided_at!, d.void_reason);
  }

  for (const w of (src.weekOpenings ?? []).filter(isVoided)) {
    push({ tipo: "Apertura de semana", fecha: w.start_date, detalle: w.note ?? "", monto: null }, w.voided_at!, w.void_reason);
  }

  return rows.sort((a, b) => b.at.localeCompare(a.at)).map((r) => r.row);
}
