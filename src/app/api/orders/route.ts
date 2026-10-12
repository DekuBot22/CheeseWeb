import { clientIp } from "@/lib/client-ip";
import { created, handle } from "@/server/http";
import { submitPublicOrder } from "@/features/orders/server/submit-public-order";

// Pedido público desde la página: no requiere sesión, pero tiene campo trampa y límites.
export const POST = handle(async (request) => {
  const body = await request.json().catch(() => null);
  const order = await submitPublicOrder(body, clientIp(request.headers));
  return created({ order });
});
