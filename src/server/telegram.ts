import "server-only";
import { env } from "./env";
import { AppError } from "./errors";

export async function sendTelegramMessage(text: string, opts: { silent?: boolean } = {}): Promise<void> {
  const { TELEGRAM_BOT_TOKEN: token, TELEGRAM_CHAT_ID: chatId } = env();

  if (!token || !chatId) {
    // Notificación opcional: si no está configurada, seguimos sin romper el pedido.
    return;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", disable_notification: opts.silent ?? false }),
    });
    if (!res.ok) {
      console.error("Error enviando notificación de Telegram:", await res.text());
    }
  } catch (err) {
    console.error("Error enviando notificación de Telegram:", err);
  }
}

export interface TelegramDocument {
  name: string;
  bytes: Uint8Array;
  mime: string;
}

// Envía un archivo al chat del dueño. A diferencia del aviso de pedidos, aquí un
// fallo SÍ importa (es el respaldo): lanza un error en vez de callarlo.
export async function sendTelegramDocument(
  doc: TelegramDocument,
  caption: string,
  opts: { silent?: boolean } = {}
): Promise<void> {
  const { TELEGRAM_BOT_TOKEN: token, TELEGRAM_CHAT_ID: chatId } = env();
  if (!token || !chatId) {
    throw new AppError("Telegram no está configurado (faltan TELEGRAM_BOT_TOKEN y TELEGRAM_CHAT_ID).", 503);
  }

  const form = new FormData();
  form.set("chat_id", chatId);
  form.set("caption", caption);
  form.set("parse_mode", "HTML");
  form.set("disable_notification", String(opts.silent ?? false));
  form.set("document", new Blob([doc.bytes as BlobPart], { type: doc.mime }), doc.name);

  const res = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
    method: "POST",
    body: form,
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) {
    console.error("Error enviando documento a Telegram:", await res.text());
    throw new AppError(`Telegram rechazó el archivo ${doc.name} (código ${res.status}).`, 502);
  }
}
