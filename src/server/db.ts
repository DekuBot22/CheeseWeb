import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "./env";
import { AppError, NotFoundError } from "./errors";

let client: SupabaseClient | undefined;

// Cliente de Supabase con la service role key. Solo se usa desde los
// repositorios (`*.repo.ts`); el navegador nunca habla con Supabase.
export function db(): SupabaseClient {
  if (!client) {
    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = env();
    client = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });
  }
  return client;
}

const PAGE_SIZE = 1000;

type PageResult = PromiseLike<{
  data: unknown[] | null;
  error: { message: string; code?: string } | null;
}>;

// Códigos de "la tabla no existe": PostgREST (PGRST205, no está en su caché de
// esquema) y Postgres (42P01, relación inexistente).
const MISSING_TABLE_CODES = new Set(["PGRST205", "42P01"]);

export function isMissingTableError(err: unknown): boolean {
  const { code, message } = (err ?? {}) as { code?: string; message?: string };
  if (code !== undefined && MISSING_TABLE_CODES.has(code)) return true;
  // Respaldo por si una versión de PostgREST no manda el código.
  return typeof message === "string" && message.includes("Could not find the table");
}

// Supabase corta cada consulta en 1000 filas. Para totales "de todo el tiempo"
// hay que pedir por páginas o los números salen mal en silencio.
export async function fetchAll<T>(page: (from: number, to: number) => PageResult): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await page(from, from + PAGE_SIZE - 1);
    // Se conserva el código de Postgres para poder distinguir "tabla inexistente".
    if (error) throw Object.assign(new Error(error.message), { code: error.code });
    rows.push(...((data ?? []) as T[]));
    if (!data || data.length < PAGE_SIZE) break;
  }
  return rows;
}

// Códigos de "la columna no existe" (Postgres 42703, PostgREST PGRST204) y de
// "la función no existe" (PostgREST PGRST202, Postgres 42883).
const MISSING_COLUMN_CODES = new Set(["42703", "PGRST204"]);
const MISSING_FUNCTION_CODES = new Set(["PGRST202", "42883"]);

export function isMissingColumnError(err: unknown): boolean {
  const { code } = (err ?? {}) as { code?: string };
  return code !== undefined && MISSING_COLUMN_CODES.has(code);
}

export function isMissingFunctionError(err: unknown): boolean {
  const { code } = (err ?? {}) as { code?: string };
  return code !== undefined && MISSING_FUNCTION_CODES.has(code);
}

export const MIGRATION_005_MESSAGE =
  "Anular y editar aún no están activados: corre la migración 005 en el SQL Editor de Supabase y vuelve a intentar.";

export const MIGRATION_006_MESSAGE =
  "La nota del pedido aún no está activada: corre la migración 006 en el SQL Editor de Supabase y vuelve a intentar.";

// ¿Ya existe la migración 005 (columnas `voided_at`)? Se prueba con una consulta
// mínima. Un "sí" se recuerda siempre; un "no" solo 60 s, para que apenas el
// dueño corra el SQL el código lo note sin reiniciar nada.
const VOID_CHECK_RETRY_MS = 60_000;
let voidColumns: { ready: boolean; checkedAt: number } | undefined;

export async function hasVoidColumns(): Promise<boolean> {
  if (voidColumns?.ready) return true;
  if (voidColumns && Date.now() - voidColumns.checkedAt < VOID_CHECK_RETRY_MS) return false;

  const { error } = await db().from("orders").select("voided_at").limit(1);
  if (error && !isMissingColumnError(error)) {
    // Fallo ajeno a la migración (red, etc.): no se guarda como "no existe".
    return voidColumns?.ready ?? false;
  }
  voidColumns = { ready: !error, checkedAt: Date.now() };
  return voidColumns.ready;
}

// Anula una fila (nunca la borra). Solo anula filas vigentes: si ya estaba
// anulada o no existe, responde 404. Una sola actualización, así que es atómica.
export async function voidRow(table: string, id: string, reason: string): Promise<Record<string, unknown>> {
  if (!(await hasVoidColumns())) throw new AppError(MIGRATION_005_MESSAGE, 503);
  const { data, error } = await db()
    .from(table)
    .update({ voided_at: new Date().toISOString(), void_reason: reason.trim() })
    .eq("id", id)
    .is("voided_at", null)
    .select()
    .maybeSingle();
  if (error) {
    console.error(error);
    throw new AppError("No se pudo anular");
  }
  if (!data) throw new NotFoundError("No existe o ya estaba anulado");
  return data as Record<string, unknown>;
}

export const MIGRATION_007_MESSAGE =
  "Abrir semanas aún no está activado: corre la migración 007 en el SQL Editor de Supabase y vuelve a intentar.";
