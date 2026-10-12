import "server-only";
import type { Order } from "@/domain/order";
import { isHoneypotFilled, parseCreateOrder } from "../schemas";
import { createOrder } from "./create-order";
import { guardOrderRate } from "./order-limits";

// Pedido que llega del formulario público: primero la trampa para robots, luego la
// validación y los límites de frecuencia, y por último se guarda.
// Un robot recibe "éxito" sin que se guarde nada (así no se entera de que lo detectamos).
export async function submitPublicOrder(body: unknown, ip: string): Promise<Order | null> {
  if (isHoneypotFilled(body)) {
    console.info("Pedido descartado por el campo trampa");
    return null;
  }
  const input = parseCreateOrder(body);
  await guardOrderRate(ip, input.client_name);
  return createOrder(input);
}
