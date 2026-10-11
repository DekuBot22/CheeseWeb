import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "./env";

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
