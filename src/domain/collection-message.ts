// Mensaje de cobro por WhatsApp. Solo usa datos reales del cliente (nombre, semanas y montos); no inventa nada.

import { formatCOP, formatDayShort, formatMonth } from "@/lib/format";
import type { CollectionRow } from "./monthly-collection";

// Número para wa.me: solo dígitos y con el indicativo de Colombia (57) si vino de 10 dígitos.
// null si no parece un número real (entonces el botón deja elegir el chat).
export function whatsappNumber(phone: string | null | undefined): string | null {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (digits.length === 10 && digits.startsWith("3")) return `57${digits}`;
  if (digits.length === 12 && digits.startsWith("57")) return digits;
  if (digits.length >= 11 && digits.length <= 15 && !digits.startsWith("0")) return digits;
  return null;
}

const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? name;

const weekLine = (w: CollectionRow["weeks"][number]) =>
  `• ${formatDayShort(w.from)} al ${formatDayShort(w.to)}: ${formatCOP(w.owed)}`;

export function collectionMessage(row: CollectionRow, month: string): string {
  const lines = [
    `Hola ${firstName(row.name)}, ¿cómo estás? Te escribo para recordarte lo pendiente de ${formatMonth(month)}:`,
    "",
    ...(row.weeks.length > 1 ? row.weeks.map(weekLine) : []),
    ...(row.weeks.length > 1 ? [""] : []),
    `Total: ${formatCOP(row.owed)}`,
  ];
  if (row.earlierOwed > 0) lines.push(`Además quedan ${formatCOP(row.earlierOwed)} de meses anteriores.`);
  lines.push("", "Cuando puedas me avisas. ¡Gracias!");
  return lines.join("\n");
}

// Enlace de WhatsApp con el mensaje escrito. Sin número válido abre WhatsApp para elegir el chat.
export function whatsappLink(row: CollectionRow, month: string): string {
  const number = whatsappNumber(row.phone);
  return `https://wa.me/${number ?? ""}?text=${encodeURIComponent(collectionMessage(row, month))}`;
}
