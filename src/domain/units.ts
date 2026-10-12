export type Unit = "kg" | "lb";

// En la región donde opera el negocio se maneja 1 kg = 2 lb (no el valor
// internacional 0.4536). Todos los totales y costos dependen de esta constante.
export const KG_PER_LB = 0.5;

export function toKg(quantity: number, unit: Unit): number {
  return unit === "kg" ? quantity : quantity * KG_PER_LB;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

// Precios: el dueño piensa y cobra por libra, pero la base guarda por kg.
// Con 1 kg = 2 lb las conversiones son exactas (13.000/lb ↔ 26.000/kg);
// el redondeo a 2 decimales solo protege de lo que escriba el usuario.
export const perLbToPerKg = (valuePerLb: number): number => round2(valuePerLb / KG_PER_LB);
export const perKgToPerLb = (valuePerKg: number): number => round2(valuePerKg * KG_PER_LB);

// ── Peso fácil de leer ──────────────────────────────────────────────────────
// Unidades enteras + gramos ("90 lb 380 g"), nunca libras con decimales: con
// 1 lb = 500 g, "0,30 lb" son 150 g y no 300, y así no hay que adivinar.
// Los pedidos guardan sus kg con 2 decimales (10 g), así que se cuenta en
// gramos enteros; esto también evita los restos de sumar decimales (0,1 + 0,2).
export function splitWeight(kg: number, unit: Unit): { whole: number; grams: number } {
  const totalGrams = Number.isFinite(kg) && kg > 0 ? Math.round(kg * 100) * 10 : 0;
  const gramsPerUnit = unit === "kg" ? 1000 : 1000 * KG_PER_LB;
  return { whole: Math.floor(totalGrams / gramsPerUnit), grams: totalGrams % gramsPerUnit };
}

// Miles con punto, como en es-CO, sin depender de la configuración regional del equipo.
const withThousands = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

export function formatWeight(kg: number, unit: Unit): string {
  const { whole, grams } = splitWeight(kg, unit);
  const parts: string[] = [];
  if (whole > 0) parts.push(`${withThousands(whole)} ${unit}`);
  if (grams > 0) parts.push(`${grams} g`);
  return parts.length > 0 ? parts.join(" ") : `0 ${unit}`;
}
