import { NextRequest, NextResponse } from "next/server";
import { sessionCookieOptions } from "@/features/auth/auth-mode";
import {
  COOKIE_NAME,
  bypassesAuth,
  isProduction,
  isValidSessionToken,
} from "@/features/auth/server/session";

// Cabecera interna (solo de petición) con la que el proxy le avisa al layout que
// la auth está apagada. Se borra siempre antes, así un cliente no puede inventarla.
const AUTH_OFF_HEADER = "x-admin-auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const headers = new Headers(request.headers);
  headers.delete(AUTH_OFF_HEADER);

  // Modo local: sin contraseña, solo en este PC (ver features/auth/auth-mode.ts).
  if (bypassesAuth([request.headers.get("host"), request.headers.get("x-forwarded-host")])) {
    if (pathname === "/admin/login") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    headers.set(AUTH_OFF_HEADER, "off");
    return NextResponse.next({ request: { headers } });
  }

  if (pathname === "/admin/login" || pathname === "/api/admin/login") {
    return NextResponse.next({ request: { headers } });
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const valid = await isValidSessionToken(token);

  if (!valid) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next({ request: { headers } });
  // Sesión deslizante: cada navegación de página renueva los 400 días.
  if (token && !pathname.startsWith("/api/")) {
    response.cookies.set(COOKIE_NAME, token, sessionCookieOptions(isProduction()));
  }
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
