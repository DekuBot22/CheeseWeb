import { handle, ok } from "@/server/http";
import { listClientNames } from "@/features/clients/server/clients.repo";

// Nombres de clientes para sugerir al registrar una venta (se pide al abrir la hoja).
export const GET = handle(async () => ok({ clients: await listClientNames() }));
