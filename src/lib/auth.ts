import "server-only";

export const COOKIE_NAME = "queso_admin_session";

function getSecret(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error("Falta la variable de entorno ADMIN_PASSWORD");
  }
  return password;
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
// anteriores dejan de ser válidas automáticamente.
export async function createSessionToken(): Promise<string> {
  return hmac("queso-admin-session", getSecret());
}

export async function isValidSessionToken(
  token: string | undefined | null
): Promise<boolean> {
  if (!token) return false;
  const expected = await createSessionToken();
  return token === expected;
}

export function isValidPassword(password: string): boolean {
  return password === getSecret();
}
