import { created, handle } from "@/server/http";
import { parseCreateOrder } from "@/features/orders/schemas";
import { createOrder } from "@/features/orders/server/create-order";

// Pedido público desde la página: no requiere sesión.
export const POST = handle(async (request) => {
  const body = await request.json().catch(() => null);
  const order = await createOrder(parseCreateOrder(body));
  return created({ order });
});
