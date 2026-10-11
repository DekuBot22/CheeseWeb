import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import type { z } from "zod";
import { AppError, ValidationError } from "./errors";

export function ok<T>(body: T, status = 200) {
  return NextResponse.json(body, { status });
}

export function created<T>(body: T) {
  return ok(body, 201);
}

// Envuelve un route handler: los AppError salen con su código y mensaje; lo
// inesperado se registra y responde 500 con un mensaje genérico.
export function handle<Ctx = unknown>(fn: (request: NextRequest, ctx: Ctx) => Promise<Response>) {
  return async (request: NextRequest, ctx: Ctx): Promise<Response> => {
    try {
      return await fn(request, ctx);
    } catch (err) {
      if (err instanceof AppError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      console.error(err);
      return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
  };
}

// Lee el cuerpo JSON y lo valida; si no cumple, responde 400 con el primer mensaje.
export async function parseJson<T>(request: NextRequest, schema: z.ZodType<T>): Promise<T> {
  const raw = await request.json().catch(() => null);
  // Un cuerpo vacío o que no es un objeto se trata como `{}`: así el error es el
  // mensaje claro del primer campo, no el de zod sobre el tipo del cuerpo.
  const body = typeof raw === "object" && raw !== null && !Array.isArray(raw) ? raw : {};
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new ValidationError(result.error.issues[0]?.message ?? "Datos inválidos");
  }
  return result.data;
}
