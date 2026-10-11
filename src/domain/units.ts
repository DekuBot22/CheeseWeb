export type Unit = "kg" | "lb";

// En la región donde opera el negocio se maneja 1 kg = 2 lb (no el valor
// internacional 0.4536). Todos los totales y costos dependen de esta constante.
export const KG_PER_LB = 0.5;

export function toKg(quantity: number, unit: Unit): number {
  return unit === "kg" ? quantity : quantity * KG_PER_LB;
}
