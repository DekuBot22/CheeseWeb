import "server-only";
import { supabaseAdmin } from "./supabase";

// Busca un cliente por nombre (sin importar mayúsculas/espacios) o lo crea
// si no existe. Así cada pedido de la web queda asociado a un cliente con
// su propio historial, sin que el cliente tenga que "iniciar sesión".
export async function findOrCreateClient(name: string): Promise<string> {
  const trimmed = name.trim();
  const key = trimmed.toLowerCase();

  const { data: existing } = await supabaseAdmin
    .from("clients")
    .select("id")
    .eq("name_key", key)
    .maybeSingle();

  if (existing) return existing.id as string;

  const { data: created, error } = await supabaseAdmin
    .from("clients")
    .insert({ name: trimmed, name_key: key })
    .select("id")
    .single();

  if (error) {
    // Otro pedido pudo haber creado el mismo cliente al mismo tiempo.
    const { data: retry } = await supabaseAdmin
      .from("clients")
      .select("id")
      .eq("name_key", key)
      .maybeSingle();
    if (retry) return retry.id as string;
    throw new Error("No se pudo crear el cliente");
  }

  return created.id as string;
}
