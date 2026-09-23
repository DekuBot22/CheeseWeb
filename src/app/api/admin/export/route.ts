import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { supabaseAdmin } from "@/lib/supabase";
import { toKg, CHEESE_TYPE_LABELS, SALT_LEVEL_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/constants";
import { computeStats } from "@/lib/accounting";
import type { Order, Purchase, ProviderPayment } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const startParam = searchParams.get("start");
  const endParam = searchParams.get("end");

  const start = startParam ? new Date(startParam) : new Date(0);
  const end = endParam ? new Date(endParam) : new Date();

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return NextResponse.json({ error: "Rango de fechas inválido" }, { status: 400 });
  }

  const startDateOnly = start.toISOString().slice(0, 10);
  const endDateOnly = end.toISOString().slice(0, 10);

  const [{ data: orders }, { data: purchases }, { data: providerPayments }, { data: debtOrders }] =
    await Promise.all([
      supabaseAdmin
        .from("orders")
        .select("*")
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString())
        .order("created_at", { ascending: true }),
      supabaseAdmin
        .from("purchases")
        .select("*")
        .gte("purchase_date", startDateOnly)
        .lte("purchase_date", endDateOnly)
        .order("purchase_date", { ascending: true }),
      supabaseAdmin
        .from("provider_payments")
        .select("*")
        .gte("payment_date", startDateOnly)
        .lte("payment_date", endDateOnly)
        .order("payment_date", { ascending: true }),
      supabaseAdmin
        .from("orders")
        .select("client_id, client_name, total, amount_paid, payment_status")
        .neq("payment_status", "pagado"),
    ]);

  const orderList = (orders as Order[]) ?? [];
  const purchaseList = (purchases as Purchase[]) ?? [];
  const paymentList = (providerPayments as ProviderPayment[]) ?? [];
  const stats = computeStats(orderList, purchaseList, paymentList);

  const debtByClient = new Map<string, { name: string; debt: number }>();
  for (const o of (debtOrders as Pick<
    Order,
    "client_id" | "client_name" | "total" | "amount_paid" | "payment_status"
  >[]) ?? []) {
    const key = o.client_id ?? o.client_name;
    const remaining = Math.max(Number(o.total) - Number(o.amount_paid), 0);
    const current = debtByClient.get(key);
    debtByClient.set(key, {
      name: o.client_name,
      debt: (current?.debt ?? 0) + remaining,
    });
  }
  const debtRows = [...debtByClient.values()]
    .filter((r) => r.debt > 0)
    .sort((a, b) => b.debt - a.debt);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "QuesoWeb";
  workbook.created = new Date();

  const resumen = workbook.addWorksheet("Resumen");
  resumen.columns = [
    { header: "Concepto", key: "concepto", width: 32 },
    { header: "Valor", key: "valor", width: 20 },
  ];
  resumen.addRows([
    { concepto: "Período", valor: `${startDateOnly} a ${endDateOnly}` },
    { concepto: "Ingresos (pedidos)", valor: stats.revenue },
    { concepto: "Cobrado", valor: stats.collected },
    {
      concepto: stats.usingRealCost ? "Costo (compras registradas)" : "Costo (estimado por kg)",
      valor: stats.cost,
    },
    { concepto: "Pagado al proveedor", valor: stats.pagadoProveedor },
    { concepto: "Saldo con proveedor", valor: stats.saldoProveedor },
    { concepto: "Ganancia neta", valor: stats.profit },
    { concepto: "Margen (%)", valor: Number(stats.margin.toFixed(1)) },
  ]);
  resumen.getRow(1).font = { bold: true };

  const pedidos = workbook.addWorksheet("Pedidos");
  pedidos.columns = [
    { header: "Fecha", key: "fecha", width: 20 },
    { header: "Cliente", key: "cliente", width: 24 },
    { header: "Cantidad", key: "cantidad", width: 12 },
    { header: "Unidad", key: "unidad", width: 10 },
    { header: "Tipo", key: "tipo", width: 12 },
    { header: "Sal", key: "sal", width: 14 },
    { header: "Total", key: "total", width: 14 },
    { header: "Pagado", key: "pagado", width: 14 },
    { header: "Estado pago", key: "estado_pago", width: 14 },
    { header: "Estado", key: "estado", width: 14 },
  ];
  for (const o of orderList) {
    pedidos.addRow({
      fecha: new Date(o.created_at).toLocaleString("es-CO"),
      cliente: o.client_name,
      cantidad: Number(o.quantity),
      unidad: o.unit,
      tipo: CHEESE_TYPE_LABELS[o.cheese_type],
      sal: SALT_LEVEL_LABELS[o.salt_level],
      total: Number(o.total),
      pagado: Number(o.amount_paid),
      estado_pago: PAYMENT_STATUS_LABELS[o.payment_status],
      estado: o.status,
    });
  }
  pedidos.getRow(1).font = { bold: true };

  const clientesDeuda = workbook.addWorksheet("Clientes con deuda");
  clientesDeuda.columns = [
    { header: "Cliente", key: "cliente", width: 28 },
    { header: "Debe", key: "debe", width: 16 },
  ];
  for (const row of debtRows) {
    clientesDeuda.addRow({ cliente: row.name, debe: row.debt });
  }
  clientesDeuda.getRow(1).font = { bold: true };

  const compras = workbook.addWorksheet("Compras y pagos a proveedor");
  compras.columns = [
    { header: "Tipo", key: "tipo", width: 12 },
    { header: "Fecha", key: "fecha", width: 14 },
    { header: "Kg", key: "kg", width: 10 },
    { header: "Monto", key: "monto", width: 14 },
    { header: "Detalle", key: "detalle", width: 30 },
  ];
  for (const p of purchaseList) {
    compras.addRow({
      tipo: "Compra",
      fecha: p.purchase_date,
      kg: Number(p.kg),
      monto: Number(p.total_cost),
      detalle: p.description ?? "",
    });
  }
  for (const p of paymentList) {
    compras.addRow({
      tipo: "Pago a proveedor",
      fecha: p.payment_date,
      kg: "",
      monto: Number(p.amount),
      detalle: [p.method, p.notes].filter(Boolean).join(" · "),
    });
  }
  compras.getRow(1).font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="quesoweb-${startDateOnly}-a-${endDateOnly}.xlsx"`,
    },
  });
}
