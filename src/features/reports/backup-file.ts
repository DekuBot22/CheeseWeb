import { bogotaDate } from "@/lib/bogota-time";
import { plural } from "@/lib/format";

// Telegram acepta archivos de hasta 50 MB; se deja un margen.
export const TELEGRAM_DOC_MAX_BYTES = 49 * 1024 * 1024;
// Por encima de este tamaño el JSON se comprime antes de enviarlo.
export const GZIP_THRESHOLD_BYTES = 45 * 1024 * 1024;

export function backupFileNames(now: Date): { date: string; json: string; jsonGz: string; xlsx: string } {
  const date = bogotaDate(now);
  return {
    date,
    json: `respaldo-${date}.json`,
    jsonGz: `respaldo-${date}.json.gz`,
    xlsx: `quesoweb-respaldo-${date}.xlsx`,
  };
}

export interface BackupCounts {
  clients: number;
  orders: number;
  payments: number;
  purchases: number;
}

// Texto que acompaña al JSON en Telegram.
export function backupCaption(counts: BackupCounts, date: string): string {
  return (
    `💾 <b>Respaldo del ${date}</b>\n` +
    `${plural(counts.clients, "cliente")} · ${plural(counts.orders, "pedido")} · ` +
    `${plural(counts.payments, "abono")} · ${plural(counts.purchases, "compra")}`
  );
}

export function fitsTelegram(bytes: number): boolean {
  return bytes <= TELEGRAM_DOC_MAX_BYTES;
}
