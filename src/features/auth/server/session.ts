import "server-only";
import { env } from "@/server/env";
import { isAuthDisabled, shouldBypassAuth, timingSafeEqualStr } from "../auth-mode";

export const COOKIE_NAME = "queso_admin_session";

function getSecret(): string {
  return env().ADMIN_PASSWORD;
}

async function hmac(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Token de sesión determinístico: se deriva de ADMIN_PASSWORD, así que no
// necesitamos una tabla de sesiones. Si cambias la contraseña, las sesiones
// anteriores dejan de ser válidas automáticamente (así se revocan todas).
export async function createSessionToken(): Promise<string> {
  return hmac("queso-admin-session", getSecret());
}

export async function isValidSessionToken(
  token: string | undefined | null
): Promise<boolean> {
  if (!token) return false;
  const expected = await createSessionToken();
  return timingSafeEqualStr(token, expected);
}

export function isValidPassword(password: string): boolean {
  return timingSafeEqualStr(password, getSecret());
}

export function isProduction(): boolean {
  return env().NODE_ENV === "production";
}

// ¿La auth está apagada por configuración? (solo informa; el proxy además exige loopback)
export function authDisabled(): boolean {
  return isAuthDisabled(env());
}

// `hostHeaders`: las cabeceras Host y x-forwarded-host de la petición.
export function bypassesAuth(hostHeaders: Array<string | null | undefined>): boolean {
  return shouldBypassAuth(env(), hostHeaders);
}
