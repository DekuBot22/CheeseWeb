import "server-only";
import { gzipSync } from "node:zlib";
import { AppError } from "@/server/errors";
import { sendTelegramDocument, sendTelegramMessage } from "@/server/telegram";
import {
  backupCaption,
  backupFileNames,
  fitsTelegram,
  GZIP_THRESHOLD_BYTES,
} from "../backup-file";
import { buildExportWorkbook } from "./build-export-workbook";
import { getBackupData } from "./get-backup-data";
import { getExportData } from "./get-export-data";

const XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

const escapeHtml = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Respaldo del negocio por Telegram: un JSON completo (para restaurar) y el Excel
// de todo el tiempo (para leer en el teléfono). Si algo falla, avisa con sonido.
export async function sendDailyBackup(now: Date = new Date()): Promise<{ files: string[]; bytes: number }> {
  const names = backupFileNames(now);
  try {
    const { counts, json } = await getBackupData(now);
    let jsonBytes: Uint8Array = new TextEncoder().encode(JSON.stringify(json));
    let jsonName = names.json;
    if (jsonBytes.length > GZIP_THRESHOLD_BYTES) {
      jsonBytes = gzipSync(jsonBytes);
      jsonName = names.jsonGz;
    }
    if (!fitsTelegram(jsonBytes.length)) throw new AppError("El respaldo es demasiado grande para Telegram.");

    const excel = await buildExportWorkbook(await getExportData(new Date(0), now));
    if (!fitsTelegram(excel.length)) throw new AppError("El Excel es demasiado grande para Telegram.");

    await sendTelegramDocument(
      { name: jsonName, bytes: jsonBytes, mime: jsonName.endsWith(".gz") ? "application/gzip" : "application/json" },
      backupCaption(counts, names.date),
      { silent: true }
    );
    await sendTelegramDocument({ name: names.xlsx, bytes: excel, mime: XLSX }, "📊 Excel de todo el tiempo", { silent: true });

    return { files: [jsonName, names.xlsx], bytes: jsonBytes.length + excel.length };
  } catch (err) {
    const reason = err instanceof Error ? err.message : "error desconocido";
    await sendTelegramMessage(
      `⚠️ <b>No se pudo hacer el respaldo de hoy</b>\n${escapeHtml(reason)}\nDescarga el Excel a mano desde Ganancias.`
    );
    throw err;
  }
}
