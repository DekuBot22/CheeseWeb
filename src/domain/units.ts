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
