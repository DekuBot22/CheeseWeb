import "server-only";
import { env } from "./env";

export async function sendTelegramMessage(text: string): Promise<void> {
  const { TELEGRAM_BOT_TOKEN: token, TELEGRAM_CHAT_ID: chatId } = env();

  if (!token || !chatId) {
    // Notificación opcional: si no está configurada, seguimos sin romper el pedido.
    return;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
    if (!res.ok) {
      console.error("Error enviando notificación de Telegram:", await res.text());
    }
  } catch (err) {
    console.error("Error enviando notificación de Telegram:", err);
  }
}
