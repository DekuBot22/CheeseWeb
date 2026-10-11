// Reglas puras de autenticación (sin Next ni servidor): se prueban solas y
// se pueden importar desde el proxy, las rutas y los tests.

// 400 días: el máximo que aceptan Chrome y Safari para una cookie.
export const SESSION_MAX_AGE_S = 400 * 24 * 60 * 60;

export interface AuthEnv {
  ADMIN_AUTH?: string;
  NODE_ENV?: string;
  VERCEL?: string;
}

// "Sin contraseña" existe solo para trabajar en el PC. Se apaga la auth ÚNICAMENTE si
// se cumplen las tres condiciones de entorno a la vez; no hay ninguna variable
// que lo permita en producción ni en Vercel (esa sería la puerta que alguien
// acaba dejando abierta).
export function isAuthDisabled(env: AuthEnv): boolean {
  return env.ADMIN_AUTH === "off" && env.NODE_ENV !== "production" && !env.VERCEL;
}

export function isLoopbackHost(hostname: string): boolean {
  return ["localhost", "127.0.0.1", "::1", "[::1]"].includes(hostname);
}

// "192.168.1.5:3000" → "192.168.1.5"; "[::1]:3000" → "[::1]". Cabecera Host / x-forwarded-host.
export function hostnameFromHostHeader(host: string | null | undefined): string {
  const value = (host ?? "").trim().toLowerCase();
  if (value.startsWith("[")) {
    const end = value.indexOf("]");
    return end === -1 ? value : value.slice(0, end + 1);
  }
  return value.split(":")[0];
}

// Cuarta condición: la petición debe llegar por loopback, así que un servidor de
// desarrollo escuchando en toda la red local no expone el panel. Se mira la cabecera
// Host REAL (no `request.nextUrl`, que Next normaliza al host del servidor) y,
// si existe, x-forwarded-host: TODAS las que lleguen deben ser loopback.
export function areLoopbackHosts(hostHeaders: Array<string | null | undefined>): boolean {
  const hostnames = hostHeaders
    .flatMap((header) => (header ?? "").split(","))
    .map((part) => part.trim())
    .filter(Boolean)
    .map(hostnameFromHostHeader);
  return hostnames.length > 0 && hostnames.every(isLoopbackHost);
}

export function shouldBypassAuth(env: AuthEnv, hostHeaders: Array<string | null | undefined>): boolean {
  return isAuthDisabled(env) && areLoopbackHosts(hostHeaders);
}

export function sessionCookieOptions(isProd: boolean) {
  return {
    httpOnly: true as const,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_S,
  };
}

// Comparación en tiempo constante: el tiempo no revela cuántos caracteres coinciden.
export function timingSafeEqualStr(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const x = enc.encode(a);
  const y = enc.encode(b);
  let diff = x.length ^ y.length;
  const len = Math.max(x.length, y.length);
  for (let i = 0; i < len; i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}
