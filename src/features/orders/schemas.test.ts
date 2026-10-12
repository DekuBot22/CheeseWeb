import { describe, expect, it } from "vitest";
import { createSaleSchema, editOrderSchema, isHoneypotFilled, parseCreateOrder, voidSchema } from "./schemas";

describe("isHoneypotFilled", () => {
  it("solo se dispara si el campo trampa trae texto", () => {
    expect(isHoneypotFilled({ website: "http://spam.example" })).toBe(true);
    expect(isHoneypotFilled({ website: "  " })).toBe(false);
    expect(isHoneypotFilled({ website: "" })).toBe(false);
    expect(isHoneypotFilled({})).toBe(false);
    expect(isHoneypotFilled(null)).toBe(false);
  });
});

describe("parseCreateOrder", () => {
  it("ignora el campo trampa y acepta el pedido normal", () => {
    const input = parseCreateOrder({
      client_name: "Rosa",
      quantity: 2,
      unit: "lb",
      cheese_type: "semi",
      salt_level: "bajo",
      website: "",
    });
    expect(input.client_name).toBe("Rosa");
  });
});

describe("voidSchema", () => {
  it("pide un motivo de al menos 3 letras", () => {
    expect(voidSchema.safeParse({ reason: "ab" }).success).toBe(false);
    expect(voidSchema.safeParse({}).success).toBe(false);
    expect(voidSchema.parse({ reason: "  Duplicado " }).reason).toBe("Duplicado");
  });
});

describe("createSaleSchema", () => {
  it("acepta una venta por cantidad con solo lo imprescindible (sin claves opcionales)", () => {
    const sale = createSaleSchema.parse({ client_name: "Rosa", mode: "cantidad", quantity: 3 });
    expect(sale).toMatchObject({ unit: "lb", cheese_type: "semi", salt_level: "intermedio", paid: false, date: null, method: null });
  });

  it("acepta una venta por valor ya pagada", () => {
    const sale = createSaleSchema.parse({ client_name: "Luis", mode: "valor", amount: 15000, paid: true, method: "Nequi" });
    expect(sale).toMatchObject({ amount: 15000, paid: true, method: "Nequi" });
  });

  it("rechaza cantidad o valor fuera de rango y fechas futuras", () => {
    expect(createSaleSchema.safeParse({ client_name: "Rosa", mode: "cantidad" }).success).toBe(false);
    expect(createSaleSchema.safeParse({ client_name: "Rosa", mode: "cantidad", quantity: 0 }).success).toBe(false);
    expect(createSaleSchema.safeParse({ client_name: "Rosa", mode: "valor", amount: 500 }).success).toBe(false);
    expect(createSaleSchema.safeParse({ client_name: "Rosa", mode: "cantidad", quantity: 1, date: "2999-01-01" }).success).toBe(false);
    expect(createSaleSchema.safeParse({ client_name: "R", mode: "cantidad", quantity: 1 }).success).toBe(false);
  });

  it("acepta un descuento opcional por unidad y rechaza uno negativo", () => {
    const base = { client_name: "Rosa", mode: "cantidad", quantity: 5, unit: "kg" };
    expect(createSaleSchema.parse({ ...base, discount: 1000 }).discount).toBe(1000);
    expect(createSaleSchema.parse(base).discount).toBeUndefined();
    expect(createSaleSchema.safeParse({ ...base, discount: -5 }).success).toBe(false);
  });

  it("acepta una fecha pasada", () => {
    expect(createSaleSchema.parse({ client_name: "Rosa", mode: "cantidad", quantity: 1, date: "2026-01-02" }).date).toBe("2026-01-02");
  });
});

describe("editOrderSchema", () => {
  it("convierte cantidad y total a número", () => {
    expect(editOrderSchema.parse({ client_name: " Ana ", quantity: "2.5", unit: "kg", total: "65000" })).toEqual({
      client_name: "Ana",
      quantity: 2.5,
      unit: "kg",
      total: 65000,
    });
  });

  it("rechaza total o cantidad no positivos", () => {
    expect(editOrderSchema.safeParse({ client_name: "Ana", quantity: 0, unit: "kg", total: 1000 }).success).toBe(false);
    expect(editOrderSchema.safeParse({ client_name: "Ana", quantity: 1, unit: "kg", total: 0 }).success).toBe(false);
  });
});
