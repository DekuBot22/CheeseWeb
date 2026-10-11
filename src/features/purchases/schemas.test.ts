import { describe, expect, it } from "vitest";
import { createProviderDiscountSchema } from "./schemas";

const base = { discount_date: "2026-10-10", amount: 150000, reason: "salado" };

const firstError = (input: unknown) => {
  const r = createProviderDiscountSchema.safeParse(input);
  return r.success ? null : r.error.issues[0].message;
};

describe("createProviderDiscountSchema", () => {
  it("acepta un descuento válido y deja opcionales en null", () => {
    const r = createProviderDiscountSchema.safeParse(base);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data).toMatchObject({ amount: 150000, purchase_id: null, kg: null, notes: null });
  });

  it("monto 0 → Monto inválido", () => {
    expect(firstError({ ...base, amount: 0 })).toBe("Monto inválido");
  });

  it("motivo 'otro' sin nota → pide escribir el motivo", () => {
    expect(firstError({ ...base, reason: "otro" })).toBe("Escribe el motivo del descuento");
    expect(firstError({ ...base, reason: "otro", notes: "descuento pactado" })).toBeNull();
  });

  it("motivo desconocido → Elige un motivo", () => {
    expect(firstError({ ...base, reason: "inventado" })).toBe("Elige un motivo");
  });

  it("purchase_id vacío → null, y uno mal formado se rechaza", () => {
    const r = createProviderDiscountSchema.safeParse({ ...base, purchase_id: "" });
    expect(r.success && r.data.purchase_id).toBeNull();
    expect(firstError({ ...base, purchase_id: "no-es-un-uuid" })).toBe("Compra inválida");
  });

  it("kg vacío → null, y negativos se rechazan", () => {
    const r = createProviderDiscountSchema.safeParse({ ...base, kg: "" });
    expect(r.success && r.data.kg).toBeNull();
    expect(firstError({ ...base, kg: -2 })).toBe("Kg inválidos");
  });

  it("recorta una nota larga en vez de rechazarla", () => {
    const r = createProviderDiscountSchema.safeParse({ ...base, notes: "x".repeat(500) });
    expect(r.success && r.data.notes?.length).toBe(300);
  });
});
