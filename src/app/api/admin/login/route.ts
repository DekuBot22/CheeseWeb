import { NextResponse } from "next/server";
import { AppError } from "@/server/errors";
import { handle, parseJson } from "@/server/http";
import { sessionCookieOptions } from "@/features/auth/auth-mode";
import { loginSchema } from "@/features/auth/schemas";
import {
  COOKIE_NAME,
  createSessionToken,
  isProduction,
  isValidPassword,
} from "@/features/auth/server/session";

export const POST = handle(async (request) => {
  const { password } = await parseJson(request, loginSchema);
  if (typeof password !== "string" || !isValidPassword(password)) {
    throw new AppError("Contraseña incorrecta", 401);
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, await createSessionToken(), sessionCookieOptions(isProduction()));
  return response;
});
