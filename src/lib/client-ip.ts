// IP del visitante según las cabeceras de Vercel: `x-real-ip` o, si falta, la primera
// de `x-forwarded-for` (Vercel las reescribe, el visitante no las controla).
export function clientIp(headers: Headers): string {
  const real = headers.get("x-real-ip")?.trim();
  if (real) return real;
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || "desconocida";
}
