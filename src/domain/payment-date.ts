// Fecha elegida para un abono ("Otra fecha"): por ejemplo, la plata llegó ayer y se registra hoy.
// Solo cambia la fecha que se muestra del abono. En Ganancias un abono sigue contando en la semana
// del PEDIDO, así que elegir otra fecha no mueve ninguna cifra de ahí.

import { bogotaDate } from "@/lib/bogota-time";
import { saleTimestamp } from "./order";

// Mensaje de error si la fecha no sirve para abonar a ese pedido; null si sirve (o si no se eligió fecha).
export function paymentDateError(date: string | null | undefined, orderCreatedAt: string, now: Date): string | null {
  if (!date) return null;
  if (date > bogotaDate(now)) return "La fecha del abono no puede ser futura";
  if (date < bogotaDate(new Date(orderCreatedAt))) return "El abono no puede ser anterior al pedido";
  return null;
}

// Instante del abono: hoy → ahora; un día pasado → ese día a las 12:00 de Bogotá, pero nunca antes del pedido
// (si el pedido se hizo ese mismo día por la tarde, el abono queda justo después de él).
export function paymentTimestamp(date: string | null | undefined, orderCreatedAt: string, now: Date): string {
  const at = saleTimestamp(date, now);
  return at < orderCreatedAt ? orderCreatedAt : at;
}
