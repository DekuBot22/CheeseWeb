import { created, handle, parseJson } from "@/server/http";
import { createSaleSchema } from "@/features/orders/schemas";
import { createSale } from "@/features/orders/server/create-sale";

// Venta registrada por el dueño desde el panel.
export const POST = handle(async (request) => created(await createSale(await parseJson(request, createSaleSchema))));
