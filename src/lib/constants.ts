import type { CheeseType, SaltLevel } from "./types";

export const KG_PER_LB = 0.45359237;

export const CHEESE_TYPE_LABELS: Record<CheeseType, string> = {
  duro: "Duro",
  semi: "Semi-duro",
  blando: "Blando",
};

export const SALT_LEVEL_LABELS: Record<SaltLevel, string> = {
  alto: "Alto en sal",
  intermedio: "Sal intermedia",
  bajo: "Bajo en sal",
};

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
