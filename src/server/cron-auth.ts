import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { env } from "./env";

const digest = (value: string) => createHash("sha256").update(value).digest();

// ¿La petición viene del cron de Vercel? Vercel manda `Authorization: Bearer <CRON_SECRET>`
// cuando la variable existe. Sin secreto configurado nunca se acepta nada.
export function isCronRequest(request: Request): boolean {
  const { CRON_SECRET: secret } = env();
  if (!secret) return false;
  const header = request.headers.get("authorization") ?? "";
  return timingSafeEqual(digest(header), digest(`Bearer ${secret}`));
}
