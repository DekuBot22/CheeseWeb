import "server-only";
import { db } from "@/server/db";

// Cuenta un intento en la ventana de `key` y dice si todavía está dentro del límite.
// Si la función SQL no existe (migración 005 sin correr) o la base falla, DEJA PASAR:
// es mejor aceptar un pedido de más que rechazar uno legítimo.
export async function hitLimit(key: string, windowSeconds: number, max: number): Promise<boolean> {
  const { data, error } = await db().rpc("hit_limit", {
    p_key: key,
    p_window_seconds: windowSeconds,
    p_max: max,
  });
  if (error) return true;
  return data !== false;
}
