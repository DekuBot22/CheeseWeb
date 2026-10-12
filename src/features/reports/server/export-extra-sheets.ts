import "server-only";
import type ExcelJS from "exceljs";
import type { ExportData } from "./get-export-data";

function addSheet(workbook: ExcelJS.Workbook, name: string, columns: Partial<ExcelJS.Column>[]) {
  const sheet = workbook.addWorksheet(name);
  sheet.columns = columns;
  sheet.getRow(1).font = { bold: true };
  return sheet;
}

const bogota = (iso: string) => new Date(iso).toLocaleString("es-CO", { timeZone: "America/Bogota" });

// Hojas que completan el Excel: abonos de clientes, ficha de clientes y lo anulado.
export function addExtraSheets(workbook: ExcelJS.Workbook, data: ExportData) {
  const abonos = addSheet(workbook, "Abonos", [
    { header: "Fecha", key: "fecha", width: 20 },
    { header: "Cliente", key: "cliente", width: 24 },
    { header: "Monto", key: "monto", width: 14 },
    { header: "Método", key: "metodo", width: 18 },
  ]);
  for (const p of data.clientPayments) {
    abonos.addRow({
      fecha: bogota(p.created_at),
      cliente: p.orders?.client_name ?? "",
      monto: Number(p.amount),
      metodo: p.method ?? "",
    });
  }

  const clientes = addSheet(workbook, "Clientes", [
    { header: "Cliente", key: "cliente", width: 28 },
    { header: "Teléfono", key: "telefono", width: 16 },
    { header: "Saldo a favor", key: "saldo", width: 16 },
    { header: "Notas", key: "notas", width: 36 },
  ]);
  for (const c of data.clients) {
    clientes.addRow({ cliente: c.name, telefono: c.phone ?? "", saldo: Number(c.credit_balance), notas: c.notes ?? "" });
  }

  const anulados = addSheet(workbook, "Anulados", [
    { header: "Tipo", key: "tipo", width: 20 },
    { header: "Fecha", key: "fecha", width: 20 },
    { header: "Detalle", key: "detalle", width: 28 },
    { header: "Monto", key: "monto", width: 14 },
    { header: "Anulado el", key: "anuladoEl", width: 20 },
    { header: "Motivo", key: "motivo", width: 36 },
  ]);
  anulados.addRows(data.voided);
}
