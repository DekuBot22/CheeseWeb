import { z } from "zod";

// Los formularios y las rutas históricas del proyecto convertían los datos con
// Number(x) / String(x) y mostraban un mensaje por campo. Estos ayudantes
// conservan esa conversión y los mensajes literales.

// Number(x): texto, número, null (→ 0) o ausente (→ NaN), validado con `ok`.
export function numberField(ok: (n: number) => boolean, message: string) {
  return z
    .unknown()
    .transform((v) => Number(v))
    .refine(ok, message);
}

export const isPositive = (n: number) => Number.isFinite(n) && n > 0;
export const isNonNegative = (n: number) => Number.isFinite(n) && n >= 0;

// Fecha AAAA-MM-DD obligatoria.
export function dateField(message: string) {
  return z
    .unknown()
    .transform((v) => String(v ?? ""))
    .refine((s) => /^\d{4}-\d{2}-\d{2}$/.test(s), message);
}

// Texto libre opcional: vacío → null; si es largo se recorta (no se rechaza).
// OJO: `.optional()` antes de `transform` es imprescindible. Sin él, zod 4 rechaza
// la clave cuando falta en el JSON ("expected nonoptional"), y los formularios
// omiten los campos vacíos (`campo || undefined`).
export function optionalText(maxLength: number) {
  return z
    .unknown()
    .optional()
    .transform((v) => (v ? String(v).slice(0, maxLength) : null));
}
