import "server-only";
import { db, fetchAll } from "@/server/db";
import { AppError } from "@/server/errors";
import { normalizeClientName, type Client } from "@/domain/client";

// Busca un cliente por nombre (sin importar mayúsculas/espacios) o lo crea
// si no existe. Así cada pedido de la web queda asociado a un cliente con
// su propio historial, sin que el cliente tenga que "iniciar sesión".
export async function findOrCreateClient(name: string): Promise<string> {
  const { name: trimmed, key } = normalizeClientName(name);

  const { data: existing } = await db()
    .from("clients")
    .select("id")
    .eq("name_key", key)
    .maybeSingle();

  if (existing) return existing.id as string;

  const { data: created, error } = await db()
    .from("clients")
    .insert({ name: trimmed, name_key: key })
    .select("id")
    .single();

  if (error) {
    // Otro pedido pudo haber creado el mismo cliente al mismo tiempo.
    const { data: retry } = await db().from("clients").select("id").eq("name_key", key).maybeSingle();
    if (retry) return retry.id as string;
    throw new AppError("No se pudo registrar el cliente");
  }

  return created.id as string;
}

export async function getClient(id: string): Promise<Client | null> {
  const { data } = await db().from("clients").select("*").eq("id", id).single();
  return (data as Client | null) ?? null;
}

export function listClients(): Promise<Client[]> {
  return fetchAll<Client>((from, to) =>
    db().from("clients").select("*").order("name", { ascending: true }).range(from, to)
  );
}

export async function updateClient(
  id: string,
  fields: { phone?: string | null; notes?: string | null }
): Promise<Client> {
  const { data, error } = await db().from("clients").update(fields).eq("id", id).select().single();
  if (error || !data) throw new AppError("No se pudo actualizar el cliente");
  return data as Client;
}

// Suma saldo a favor al cliente (lee y luego escribe: no es atómico).
export async function addCredit(clientId: string, amount: number): Promise<void> {
  const { data: client } = await db()
    .from("clients")
    .select("credit_balance")
    .eq("id", clientId)
    .single();
  if (!client) return;
  await db()
    .from("clients")
    .update({ credit_balance: Number(client.credit_balance) + amount })
    .eq("id", clientId);
}
