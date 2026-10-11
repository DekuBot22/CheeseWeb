import "server-only";
import ExcelJS from "exceljs";
import { CHEESE_TYPE_LABELS, SALT_LEVEL_LABELS } from "@/domain/catalog";
import { PAYMENT_STATUS_LABELS } from "@/domain/order";
import type { ExportData } from "./get-export-data";

function addSheet(workbook: ExcelJS.Workbook, name: string, columns: Partial<ExcelJS.Column>[]) {
  const sheet = workbook.addWorksheet(name);
  sheet.columns = columns;
  sheet.getRow(1).font = { bold: true };
  return sheet;
}

function summarySheet(workbook: ExcelJS.Workbook, data: ExportData) {
  const { stats } = data;
  const sheet = addSheet(workbook, "Resumen", [
    { header: "Concepto", key: "concepto", width: 32 },
    { header: "Valor", key: "valor", width: 20 },
  ]);
  sheet.addRows([
    { concepto: "Período", valor: `${data.startDate} a ${data.endDate}` },
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
}

function ordersSheet(workbook: ExcelJS.Workbook, data: ExportData) {
  const sheet = addSheet(workbook, "Pedidos", [
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
  ]);
  for (const o of data.orders) {
    sheet.addRow({
      fecha: new Date(o.created_at).toLocaleString("es-CO", { timeZone: "America/Bogota" }),
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
}

function debtorsSheet(workbook: ExcelJS.Workbook, data: ExportData) {
  const sheet = addSheet(workbook, "Clientes con deuda", [
    { header: "Cliente", key: "cliente", width: 28 },
    { header: "Debe", key: "debe", width: 16 },
  ]);
  for (const d of data.debtors) sheet.addRow({ cliente: d.name, debe: d.owed });
}

function providerSheet(workbook: ExcelJS.Workbook, data: ExportData) {
  const sheet = addSheet(workbook, "Compras y pagos a proveedor", [
    { header: "Tipo", key: "tipo", width: 12 },
    { header: "Fecha", key: "fecha", width: 14 },
    { header: "Kg", key: "kg", width: 10 },
    { header: "Monto", key: "monto", width: 14 },
    { header: "Detalle", key: "detalle", width: 30 },
  ]);
  for (const p of data.purchases) {
    sheet.addRow({
      tipo: "Compra",
      fecha: p.purchase_date,
      kg: Number(p.kg),
      monto: Number(p.total_cost),
      detalle: p.description ?? "",
    });
  }
  for (const p of data.payments) {
    sheet.addRow({
      tipo: "Pago a proveedor",
      fecha: p.payment_date,
      kg: "",
      monto: Number(p.amount),
      detalle: [p.method, p.notes].filter(Boolean).join(" · "),
    });
  }
}

export async function buildExportWorkbook(data: ExportData): Promise<Uint8Array> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "QuesoWeb";
  workbook.created = new Date();

  summarySheet(workbook, data);
  ordersSheet(workbook, data);
  debtorsSheet(workbook, data);
  providerSheet(workbook, data);

  return new Uint8Array(await workbook.xlsx.writeBuffer());
}
