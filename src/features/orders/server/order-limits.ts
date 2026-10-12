import "server-only";
import { createHmac } from "node:crypto";
import { normalizeClientName } from "@/domain/client";
import { LIMIT_MESSAGES, limitKeys } from "@/domain/order-limits";
import { env } from "@/server/env";
import { AppError } from "@/server/errors";
import { hitLimit } from "./rate-limits.repo";

// No se guarda la IP real (datos personales): solo un HMAC con un secreto del servidor.
function hashIp(ip: string): string {
  return createHmac("sha256", env().ADMIN_PASSWORD).update(ip).digest("hex").slice(0, 32);
}

// Cuenta el pedido contra los límites de IP y de nombre; si se pasa de alguno, responde 429.
export async function guardOrderRate(ip: string, clientName: string): Promise<void> {
  const checks = limitKeys(hashIp(ip), normalizeClientName(clientName).key);
  const results = await Promise.all(checks.map((c) => hitLimit(c.key, c.seconds, c.max)));
  const exceeded = checks.find((_, i) => !results[i]);
  if (exceeded) throw new AppError(LIMIT_MESSAGES[exceeded.scope], 429);
}
