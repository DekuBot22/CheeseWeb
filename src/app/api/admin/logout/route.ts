import { NextResponse } from "next/server";
import { sessionCookieOptions } from "@/features/auth/auth-mode";
import { COOKIE_NAME, isProduction } from "@/features/auth/server/session";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  // Mismos atributos que al crearla; si no, el navegador puede no borrarla.
  response.cookies.set(COOKIE_NAME, "", { ...sessionCookieOptions(isProduction()), maxAge: 0 });
  return response;
}
