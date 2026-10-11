import "server-only";
import { db } from "@/server/db";
import type { Settings } from "@/domain/settings";

export type SettingsView = Pick<Settings, "price_per_kg" | "cost_per_kg" | "updated_at">;

// La tabla `settings` tiene una sola fila (id = 1).
export async function getSettings(): Promise<SettingsView | null> {
  const { data } = await db()
    .from("settings")
    .select("price_per_kg, cost_per_kg, updated_at")
    .eq("id", 1)
    .single();
  return data ?? null;
}

// Precio de venta y costo vigentes, para fijar el precio de un pedido nuevo.
export async function getPricing(): Promise<{ pricePerKg: number; costPerKg: number } | null> {
  const { data, error } = await db()
    .from("settings")
    .select("price_per_kg, cost_per_kg")
    .eq("id", 1)
    .single();
  if (error || !data) return null;
  return { pricePerKg: Number(data.price_per_kg), costPerKg: Number(data.cost_per_kg ?? 0) };
}

export async function updateSettings(pricePerKg: number, costPerKg: number): Promise<Settings | null> {
  const { data, error } = await db()
    .from("settings")
    .update({ price_per_kg: pricePerKg, cost_per_kg: costPerKg, updated_at: new Date().toISOString() })
    .eq("id", 1)
    .select()
    .single();
  if (error || !data) return null;
  return data as Settings;
}
