import { describe, expect, it } from "vitest";
import { isHoneypotFilled, parseCreateOrder, voidSchema } from "./schemas";

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
