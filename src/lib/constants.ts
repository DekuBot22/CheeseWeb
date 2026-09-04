export const KG_PER_LB = 0.45359237;

export function toKg(quantity: number, unit: "kg" | "lb"): number {
  return unit === "kg" ? quantity : quantity * KG_PER_LB;
}

export function formatCOP(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(iso));
}
